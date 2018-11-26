"use strict";
import React from 'react';
import { Image, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { RNCamera } from 'react-native-camera';

const AWARE_API = "http://aware-api.azurewebsites.net/api/process" 

const landmarkSize = 5;

export default class Camera extends React.Component {
  state = {
    type: 'back',
    photoId: -1,
    photos: [],
    faces: [],
    faceURI: '',
  };

  toggleFacing = () => this.setState({ type: this.state.type === 'back' ? 'front' : 'back' });

  takePicture = async () => {
    const pictureOptions = Platform.OS === 'ios' ? {forceUpOrientation: true, base64: true} : {fixOrientation: true, base64: true};
    if (this.camera) return this.camera.takePictureAsync(pictureOptions);
    return Promise.reject(new Error('no camera found'));
  };
  
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
      .then(picture => {
        console.log(`PICTURE TAKEN: ${picture.uri}`)
        this.setState({faceURI: picture.uri});
        return this.postImage(picture.base64, AWARE_API);
      })
      .then(response => console.log("POSTED IMAGE: " + JSON.stringify(response, null, 4)))
      .catch(err => console.log(err)); 
    }
  };

  postImage = async (imgBase64, url) => {
    return new Promise((resolve, reject) => {      
      const config = {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json;',
        },
        body: JSON.stringify({
          id: this.props.id,
          picture: imgBase64,
        }),
      }
      
      fetch(url, config)
      .then(response => resolve(response.json()))
      .catch(error => reject(`postImage: ${error}`));
    });
  }

  renderFace = ({ bounds, faceID, rollAngle, yawAngle }) => {
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
          { this.state.faceURI !== '' && <Image source={{uri: this.state.faceURI}} style={styles.faceButton} /> }
        </View>
        {this.renderFaces()}
        {this.renderLandmarks()}
      </RNCamera>
    );
  }
}

const styles = StyleSheet.create({
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
  faceButton: {
    flex: 0.3,
    height: 90,
    width: 50,
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
});
