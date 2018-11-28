"use strict";
import React from 'react';
import { ImageBackground, StyleSheet, Text, View } from 'react-native';
import Camera from './Components/Camera/Camera.js'

export default class App extends React.Component {

    constructor(props) {
        super(props);
        process.nextTick = setImmediate;
        this.getID()
    }

    state = { id: '' }

    getID = async () => {
      const url = 'http://aware-api.azurewebsites.net/api/register'
      const config = {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      }
      
      fetch(url, config)
      .then(response => response.json())
      .then(data => {
        console.log(`BACKEND GRANTED ID: ${data}`)
        return this.setState({id: data})
      })
      .catch(error => console.warn(`Obtaining ID: ${error}`));
    }

    render() {
        return (
            <View style={styles.container}>
                {this.state.id === '' ? <Welcome /> : <Camera id={this.state.id} />}
            </View>
        )
    }
}

const Welcome = () => {
  const text = 'Aware';

  return (
    <ImageBackground
      source={{uri: 'https://image.freepik.com/free-vector/beautiful-design_1176-257.jpg'}}
      style={{width: '100%', height: '100%'}}
    >  
      <Text
        style={{
          backgroundColor: 'transparent',
          textAlign: 'center',
          padding: 20,
          fontSize: 50,
          color: '#ff6700'
        }}
      >
        {text}
      </Text>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
      flex: 1,
      paddingTop: 10,
      backgroundColor: '#000',
  },
});
