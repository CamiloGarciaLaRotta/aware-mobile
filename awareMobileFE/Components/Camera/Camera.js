"use strict";
import React from 'react';
import { ImageEditor, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { RNCamera } from 'react-native-camera';


const faceWidth = 50
const faceHeight = 500;
const AWARE_API = "https://postman-echo.com/post" //TODO change for backend when ready

const landmarkSize = 5;

const flashModeOrder = {
  off: 'on',
  on: 'auto',
  auto: 'torch',
  torch: 'off',
};

const recordOptions = {
  mute: false,
  maxDuration: 5,
  quality: RNCamera.Constants.VideoQuality["288p"],
};

export default class Camera extends React.Component {
  state = {
    type: 'back',
    flash: 'off',
    photoId: -1,
    photos: [],
    faces: [],
    isRecording: false,
  };

  toggleFacing = () => this.setState({ type: this.state.type === 'back' ? 'front' : 'back' });

  toggleFlash = () => this.setState({ flash: flashModeOrder[this.state.flash] });

  takePicture = async () => {
    if (this.camera) return this.camera.takePictureAsync();
    return Promise.reject(new Error('no camera found'));
  };

  takeVideo = async () => {
    if (this.camera) {
      try {
        const promise = this.camera.recordAsync(recordOptions);
        if (promise) {
          this.setState({ isRecording: true });
          const data = await promise;
          this.setState({ isRecording: false });
          console.log(data);
        }
      } catch (error) {
        return Promise.reject(new Error(`takeVideo: ${error}`));
      }
    }
  }

  // gets called everytime the phone detects a new face
  onFacesDetected = ({ faces }) => {

    // new face boxes and landmarks will be displayed everytime renderFaces() gets called
    this.setState({ faces });

    // not the best approach, 
    // to throttle down the amount of pictures taken only take picture when a new face is identified 
    if (faces[0].faceID > this.state.photoId) {
      this.setState({ photoId: faces[0].faceID })

      console.log(`FACE COORDS:
        (${faces[0].bounds.origin.x}, ${faces[0].bounds.origin.y})
        W: ${faces[0].bounds.size.width}
        H: ${faces[0].bounds.size.height}`)

      this.takePicture()
      .then(picture => this.cropFace(faces[0].bounds, picture.uri))
      .then(croppedPicture => this.postImage(croppedPicture, AWARE_API))
      .then(response => console.log("POSTED IMAGE: " + JSON.stringify(response, null, 4)))
      .catch(err => console.log(err)); 
    }
  };

  postImage = async (imageURI, url) => {
    return new Promise((resolve, reject) => {

      let data = new FormData();
      data.append('picture', {uri: imageURI, name: 'face.jpg', type: 'image/jpg'});
      
      const config = {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'multipart/form-data;',
        },
        body: data,
      }
      
      fetch(url, config)
      .then(response => resolve(response.json()))
      .catch(error => reject(`postImage: ${error}`));
    });
  }

  cropFace = async (bounds, imageURI) => {
    return new Promise((resolve, reject) => {
      
      const cropData = {
        offset:{
          x:bounds.origin.x,
          y:bounds.origin.y},
        size:{width:bounds.size.width, height:bounds.size.height},
        displaySize: {width:faceWidth, height:faceHeight},
        resizeMode:'contain',
      }
    
      try {
        ImageEditor.cropImage(imageURI, cropData, 
          (successURI) => resolve(successURI),
          (error) => reject(`ImageEditor.cropImage: ${error}`),
        );
      } catch(error){ reject(`Error caught in this.cropImage: ${error}`) }
    });
  }

  renderFace({ bounds, faceID, rollAngle, yawAngle }) {
    return (
      <View
        key={faceID}
        transform={[
          { perspective: 600 },
          { rotateZ: `${rollAngle.toFixed(0)}deg` },
          { rotateY: `${yawAngle.toFixed(0)}deg` },
        ]}
        style={[
          styles.face,
          {
            ...bounds.size,
            left: bounds.origin.x,
            top: bounds.origin.y,
          },
        ]}
      >
        <Text style={styles.faceText}>ID: {faceID}</Text>
        <Text style={styles.faceText}>rollAngle: {rollAngle.toFixed(0)}</Text>
        <Text style={styles.faceText}>yawAngle: {yawAngle.toFixed(0)}</Text>
      </View>
    );
  }

  renderLandmarksOfFace(face) {
    const renderLandmark = position =>
      position && (
        <View
          style={[
            styles.landmark,
            {
              left: position.x - landmarkSize / 2,
              top: position.y - landmarkSize / 2,
            },
          ]}
        />
      );
    return (
      <View key={`landmarks-${face.faceID}`}>
        {renderLandmark(face.leftEyePosition)}
        {renderLandmark(face.rightEyePosition)}
        {renderLandmark(face.leftEarPosition)}
        {renderLandmark(face.rightEarPosition)}
        {renderLandmark(face.leftCheekPosition)}
        {renderLandmark(face.rightCheekPosition)}
        {renderLandmark(face.leftMouthPosition)}
        {renderLandmark(face.mouthPosition)}
        {renderLandmark(face.rightMouthPosition)}
        {renderLandmark(face.noseBasePosition)}
        {renderLandmark(face.bottomMouthPosition)}
      </View>
    );
  }

  renderFaces() {
    return (
      <View style={styles.facesContainer} pointerEvents="none">
        {this.state.faces.map(this.renderFace)}
      </View>
    );
  }

  renderLandmarks() {
    return (
      <View style={styles.facesContainer} pointerEvents="none">
        {this.state.faces.map(this.renderLandmarksOfFace)}
      </View>
    );
  }

  render() {
    return (
      <RNCamera
        ref={ref => {
          this.camera = ref;
        }}
        style={{
          flex: 1,
        }}
        type={this.state.type}
        flashMode={this.state.flash}
        faceDetectionLandmarks={RNCamera.Constants.FaceDetection.Landmarks.all}
        onFacesDetected={this.onFacesDetected}
        permissionDialogTitle={'Permission to use camera'}
        permissionDialogMessage={'We need your permission to use your camera phone'}
      >
        <View
          style={{
            flex: 0.5,
            backgroundColor: 'transparent',
            flexDirection: 'row',
            justifyContent: 'space-around',
          }}
        >
          <TouchableOpacity style={styles.flipButton} onPress={this.toggleFacing.bind(this)}>
            <Text style={styles.flipText}> FLIP </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.flipButton} onPress={this.toggleFlash.bind(this)}>
            <Text style={styles.flipText}> FLASH: {this.state.flash} </Text>
          </TouchableOpacity>
        </View>
        <View
          style={{
            flex: 0.1,
            backgroundColor: 'transparent',
            flexDirection: 'row',
            alignSelf: 'flex-end',
          }}
        >
          <TouchableOpacity
            style={[styles.flipButton, {
              flex: 0.3,
              alignSelf: 'flex-end',
              backgroundColor: this.state.isRecording ? 'white' : 'darkred',
            }]}
            onPress={this.state.isRecording ? () => {} : this.takeVideo.bind(this)}
          >
            {
              this.state.isRecording ?
              <Text style={styles.flipText}> ☕ </Text>
              :
              <Text style={styles.flipText}> REC </Text>
            }
          </TouchableOpacity>
        </View>
        <View
          style={{
            flex: 0.1,
            backgroundColor: 'transparent',
            flexDirection: 'row',
            alignSelf: 'flex-end',
          }}
        >
          <TouchableOpacity
            style={[styles.flipButton, styles.picButton, { flex: 0.3, alignSelf: 'flex-end' }]}
            onPress={this.takePicture.bind(this)}
          >
            <Text style={styles.flipText}> SNAP </Text>
          </TouchableOpacity>
        </View>
        {this.renderFaces()}
        {this.renderLandmarks()}
      </RNCamera>
    );
  }
}

const styles = StyleSheet.create({
  navigation: {
    flex: 1,
  },
  flipButton: {
    flex: 0.3,
    height: 40,
    marginHorizontal: 2,
    marginBottom: 10,
    marginTop: 20,
    borderRadius: 8,
    borderColor: 'white',
    borderWidth: 1,
    padding: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  flipText: {
    color: 'white',
    fontSize: 15,
  },
  item: {
    margin: 4,
    backgroundColor: 'indianred',
    height: 35,
    width: 80,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  picButton: {
    backgroundColor: 'darkseagreen',
  },
  facesContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    left: 0,
    top: 0,
  },
  face: {
    padding: 10,
    borderWidth: 2,
    borderRadius: 2,
    position: 'absolute',
    borderColor: '#FFD700',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  landmark: {
    width: landmarkSize,
    height: landmarkSize,
    position: 'absolute',
    backgroundColor: 'red',
  },
  faceText: {
    color: '#FFD700',
    fontWeight: 'bold',
    textAlign: 'center',
    margin: 10,
    backgroundColor: 'transparent',
  },
  row: {
    flexDirection: 'row',
  },
});
