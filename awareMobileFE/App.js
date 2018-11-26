"use strict";
import React, { Component } from "react";
import { View, StyleSheet, Image, Text, Button, TouchableOpacity, StatusBar } from "react-native";
import Camera from './Components/Camera/Camera.js'

export default class App extends React.Component {

    constructor(props) {
        super(props);
        this.state = { isLight: false };
        process.nextTick = setImmediate;
        this.backgroundLightMode = this.backgroundLightMode.bind(this);
        this.foregroundLigthMode = this.foregroundLightMode.bind(this);
        this.switchLigthMode = this.switchLightMode.bind(this);
    }

    backgroundLightMode(){
      if(this.state.isLight) {
        return "black"
      }
      else {
        return "white"
      }
    }

    foregroundLightMode(){
      if(this.state.isLight) {
        return "#7F8C8D"
      }
      else {
        return "#97d4fb"
      }
    }

    switchLightMode(){
      this.setState({isLight: !this.state.isLight});
      this.backgroundLightMode();
      this.foregroundLightMode();
    }

    render() {

        return (
          <View style={[styles.root, {backgroundColor: this.backgroundLightMode()}]}>
              <View style={styles.spacer}/>
              <View style={[styles.driverDataFrame, {backgroundColor: this.foregroundLightMode()}]}>
                <View style={styles.driverDataHeaderFrame}>
                  <Text style={styles.driverDataHeader}>Driver Data</Text>
                </View>
                <View style={styles.driverDataIconFrame}>
                  <View style={styles.intoxicatedIconFrame}>
                      <Image
                        style={styles.intoxicatedIcon}
                        source={require("./assets/impaired.png")}
                      />
                  </View>
                  <View style={styles.sleepinessIconFrame}>
                      <Image
                        style={styles.sleepinessIcon}
                        source={require("./assets/output-onlinepngtools.png")}
                      />
                  </View>
                  <View style={styles.distractedIconFrame}>
                      <Image
                        style={styles.distractedIcon}
                        source={require("./assets/texting.png")}
                      />
                  </View>
                  <View style={styles.sickIconFrame}>
                      <Image
                        style={styles.sickIcon}
                        source={require("./assets/sick.png")}
                      />
                  </View>
                </View>
                <View style={styles.driverDataLevelFrame}>
                  <View style={styles.intoxicatedLevelFrame}>
                    <Text style={styles.intoxicatedLevel}>10%</Text>
                  </View>
                  <View style={styles.sleepinessLevelFrame}>
                    <Text style={styles.sleepinessLevel}>18%</Text>
                  </View>
                  <View style={styles.distractedLevelFrame}>
                    <Text style={styles.distractedLevel}>34%</Text>
                  </View>
                  <View style={styles.sickLevelFrame}>
                    <Text style={styles.sickLevel}>22%</Text>
                  </View>
                </View>
              </View>

              <View style={[styles.camFrame, {backgroundColor: this.backgroundLightMode()}]}>
                  <View style={styles.camFeed}>
                      <Camera></Camera>
                      <TouchableOpacity onPress={() => this.switchLightMode()} style={styles.lightModeButton}>
                        <Image source={require("./assets/brightness.png")} style={styles.lightModeIcon}/>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.microphoneButton}>
                        <Image source={require("./assets/microphone.png")} style={styles.microphoneIcon}/>
                      </TouchableOpacity>
                  </View>
              </View>
          </View>
        )
    }
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    flexDirection: "column"
  },
  spacer: {
    flex: 0.05,
  },
  driverDataFrame: {
    flex: 0.25,
    opacity: 1,
    flexDirection: "column",
    marginLeft: "3%",
    marginRight: "3%",
    marginBottom: "3%",
    borderRadius: 15,
  },
  driverDataHeaderFrame: {
    flex: 0.3,
    marginLeft: "5%",
    marginTop: "4%",
  },
  driverDataIconFrame: {
    flex: 0.50,
    flexDirection: "row",
  },
  intoxicatedIconFrame:{
    flex: 0.25,
    alignItems: 'center',
  },
  sleepinessIconFrame:{
    flex: 0.25,
    alignItems: 'center',
  },
  distractedIconFrame:{
    flex: 0.25,
    alignItems: 'center',
  },
  sickIconFrame:{
    flex: 0.25,
    alignItems: 'center',
  },
  driverDataLevelFrame: {
    flex: 0.20,
    flexDirection: "row",
  },
  intoxicatedLevelFrame:{
    flex: 0.25,
    alignItems: 'center',
  },
  sleepinessLevelFrame:{
    flex: 0.25,
    alignItems: 'center',
  },
  distractedLevelFrame:{
    flex: 0.25,
    alignItems: 'center',
  },
  sickLevelFrame:{
    flex: 0.25,
    alignItems: 'center',
  },
  camFrame: {
    flex: 0.7,
    opacity: 1,
    alignItems: 'center',
  },
  camFeed: {
    width: '95%', 
    height: '98%',
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    overflow: 'hidden'
  },
  intoxicatedIcon: {
    width: '95%',
    height: '95%',
    opacity: 0.5,
  },
  sleepinessIcon: {
    width: '95%',
    height: '95%',
    opacity: 0.5,
  },
  distractedIcon: {
    marginTop: '20%',
    width: '72%',
    height: '72%',
    opacity: 0.5
  },
  sickIcon: {
    marginTop: '20%',
    width: '70%',
    height: '70%',
    opacity: 0.5,
  },
  driverDataHeader: {
    opacity: 0.7,
    fontSize: 32,
    fontWeight: "bold",
  },
  sickLevel: {
    backgroundColor: "transparent",
    opacity: 0.7,
    fontSize: 23,
    fontWeight: "bold",
  },
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
  lightModeButton: {
    position: 'absolute',
    left: '5%',
    bottom: '3%',
    borderWidth: 2,
    borderRadius: 30,
    borderColor: "black",
    backgroundColor: "black",
    alignItems: 'center',
    justifyContent: 'center'
  },
  lightModeIcon: {
    padding: '7%',
    backgroundColor: "black"
  },
  microphoneButton: {
    position: 'absolute',
    right: '5%',
    bottom: '3%',
    borderWidth: 2,
    borderRadius: 30,
    borderColor: "white",
    borderColor: "black",
    backgroundColor: "black",
    alignItems: 'center',
    justifyContent: 'center'
  },
  microphoneIcon: {
    padding: '7%',
  }
});
