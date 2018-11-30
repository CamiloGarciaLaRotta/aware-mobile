"use strict";
import React from 'react';
import { Alert, Image, Platform, StyleSheet, Text, TouchableOpacity, Vibration, View } from 'react-native';
import { RNCamera } from 'react-native-camera'; 

const landmarkSize = 5;

export default class Aware extends React.Component {
  state = {
    type: 'back',
    photoId: -1,
    photos: [],
    faces: [],
    faceURI: '',
    sleepyCounter: 0,
    sleepyPercentage: 0,
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
        console.log(`PICTURE TAKEN: ${picture.uri}`);
        this.setState({faceURI: picture.uri});
        return this.postImage('data:image/jpeg;base64,'+picture.base64, this.props.apiURL+'/api/process');
      })
      .then(response => {
        console.log("AWARENESS RESULTS: " + JSON.stringify(response, null, 4));
        let sleepy = ((1.0-(parseFloat(response.Sleepy))) * 100).toFixed();
        if (sleepy < 75) { sleepy -= 47}
        this.setState({sleepyPercentage: sleepy})
        if (sleepy > 50) { this.incrementSleepyCounter() }
      })
      .catch(err => console.log(err)); 
    }
  };

  incrementSleepyCounter = () => {
    this.setState({sleepyCounter: this.state.sleepyCounter + 1})
    console.log(`SLEEPY COUNTER: ${this.state.sleepyCounter}`)
    if (this.state.sleepyCounter >= 3) {
      console.log("SLEEPy ALERT")
      const PATTERN = [500, 1000, 500, 1000, 500, 1000, 500, 1000, 500, 1000]
      Vibration.vibrate(PATTERN)
      this.setState({sleepyCounter: 2})
    }
  }

  renderAlert = () => {
    return Alert.alert(
      'Awareness Alert',
      'Consitent high sleepiness',
      [
        {text: 'Call Taxi', onPress: () => console.log('ignored')},
        {text: 'Cancel', onPress: () => console.log('Cancelled'), style: 'cancel'},
        {text: 'Look for coffeshops', onPress: () => console.log('OKed')},
      ],
      { cancelable: false }
    )
  }
 
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
          image: imgBase64,
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
      <View style={styles.container} >
        <View style={styles.driverDataFrame}>
          <View style={styles.driverDataHeaderFrame}>
            <Text style={styles.driverDataHeader}>Driver Data</Text>
          </View>
          <View style={styles.driverDataIconFrame}>
            <View style={styles.intoxicatedIconFrame}>
                <Image
                  style={styles.intoxicatedIcon}
                  source={require("../../assets/impaired.png")}
                  resizeMode="contain"
                />
            </View>
            <View style={styles.sleepinessIconFrame}>
                <Image
                  style={styles.sleepinessIcon}
                  source={require("../../assets/output-onlinepngtools.png")}
                  resizeMode="contain"
                />
            </View>
            <View style={styles.distractedIconFrame}>
                <Image
                  style={styles.distractedIcon}
                  source={require("../../assets/texting.png")}
                  resizeMode="contain"
                />
            </View>
          </View>
          <View style={styles.driverDataLevelFrame}>
            <View style={styles.intoxicatedLevelFrame}>
              <Text style={styles.intoxicatedLevel}>-</Text>
            </View>
            <View style={styles.sleepinessLevelFrame}>
              <Text style={styles.sleepinessLevel}>{this.state.sleepyPercentage}%</Text>
            </View>
            <View style={styles.distractedLevelFrame}>
              <Text style={styles.distractedLevel}>-</Text>
            </View>
          </View>
        </View>

        <RNCamera
          ref={ref => {
            this.camera = ref;
          }}
          style={styles.camera}
          type={this.state.type}
          flashMode={this.state.flash}
          faceDetectionLandmarks={RNCamera.Constants.FaceDetection.Landmarks.all}
          onFacesDetected={this.onFacesDetected}
          permissionDialogTitle={'Permission to use camera'}
          permissionDialogMessage={'We need your permission to use your camera phone'}
          >
          <View style={{
            flex: 1,
            // backgroundColor: 'red',
            flexDirection: 'column-reverse',
          }}>
            <View
              style={{
                flex: 0.25,
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
          </View>
          {this.renderFaces()}
          {this.renderLandmarks()}
          {this.state.sleepyCounter >= 3 && this.renderAlert()}
        </RNCamera>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column",
  },
  
  // AWARENESS FRAMES
  driverDataFrame: {
    flex: 0.40,
    opacity: 1,
    flexDirection: "column",
    marginLeft: "2%",
    marginRight: "2%",
    borderRadius: 15,
    backgroundColor: "grey"
  },
  driverDataIconFrame: {
    flex: 0.35,
    flexDirection: "row",
    marginLeft: "2%",
    marginRight: "2%",
    // backgroundColor: "green",
  },
  driverDataLevelFrame: {
    flex: 0.20,
    flexDirection: "row",
    marginLeft: "2%",
    marginRight: "2%",
    justifyContent: 'center',
    // backgroundColor: "blue",
  },

  // TITLE
  driverDataHeaderFrame: {
    flex: 0.15,
    marginLeft: "2%",
    marginRight: "2%",
  },
  driverDataHeader: {
    opacity: 0.7,
    fontSize: 30,
    fontWeight: "bold",
    color: "white",
    textAlign:"center",
    // backgroundColor: "red",
  },

  // ICON FRAMES
  intoxicatedIconFrame:{
    flex: 0.33,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sleepinessIconFrame:{
    flex: 0.33,
    alignItems: 'center',
    justifyContent: 'center',
  },
  distractedIconFrame:{
    flex: 0.33,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  // LEVEL FRAME
  intoxicatedLevelFrame:{
    flex: 0.33,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sleepinessLevelFrame:{
    flex: 0.33,
    alignItems: 'center',
    justifyContent: 'center',
  },
  distractedLevelFrame:{
    flex: 0.33,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  // AWARENESS ICONS
  intoxicatedIcon: {
    opacity: 0.5,
    flex: 0.8,
  },
  sleepinessIcon: {
    opacity: 0.5,
    flex: 1,
  },
  distractedIcon: {
    opacity: 0.5,
    flex: 0.7,
    // backgroundColor: 'yellow',
  },

  // AWARENESS LEVELS
  distractedLevel: {
    backgroundColor: "transparent",
    opacity: 0.7,
    fontSize: 23,
    fontWeight: "bold",
  },
  sleepinessLevel: {
    backgroundColor: "transparent",
    opacity: 0.7,
    fontSize: 23,
    fontWeight: "bold",
  },
  intoxicatedLevel: {
    backgroundColor: "transparent",
    opacity: 0.7,
    fontSize: 23,
    fontWeight: "bold",
  },

  // CAMERA
  camera: {
    flex: 0.6,
    flexDirection: "column",
    marginLeft: "2%",
    marginRight: "2%",
    borderRadius: 15,
  },

  cameraOptions: {

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
  faceButton: {
    flex: 0.25,
    height: 90,
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
