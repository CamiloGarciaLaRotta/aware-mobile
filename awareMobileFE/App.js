"use strict";
import React from 'react';
import { ImageBackground, StyleSheet, Text, View } from 'react-native';
import Aware from './Components/Aware/Aware.js'

const API_URL = 'http://aware-api.azurewebsites.net'

export default class App extends React.Component {

    constructor(props) {
        super(props);
        process.nextTick = setImmediate;
        this.getID()
    }

    state = { id: '' }

    getID = async () => {
      const config = {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      }      
      fetch(API_URL+'/api/register', config)
      .then(response => response.json())
      .then(data => {
        console.log(`BACKEND GRANTED ID: ${data.id}`)
        return this.setState({id: data})
      })
      .catch(error => console.warn(`Obtaining ID: ${error}`));
    }

    render() {
        return (
            <View style={styles.container}>
                {this.state.id === '' ? <Welcome /> : <Aware apiURL={API_URL} id={this.state.id} />}
            </View>
        )
    }
}

const Welcome = () => {
  const title = 'Aware';

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
        {title}
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
