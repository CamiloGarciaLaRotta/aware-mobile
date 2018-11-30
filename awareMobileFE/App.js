"use strict";
import React from 'react';
import { ImageBackground, StyleSheet, Text, View } from 'react-native';
import Aware from './Components/Aware/Aware.js'

const API_URL = 'https://aware-api.azurewebsites.net'

export default class App extends React.Component {

    constructor(props) {
      super(props);
      process.nextTick = setImmediate;
      this.getID()
      this.startTimeout()
    }

    state = { 
      id: '',
      loading: true,
    }

    startTimeout = () => setTimeout(() => this.setState({loading: false}), 3000);

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
        return this.setState({id: data.id})
      })
      .catch(error => console.warn(`Obtaining ID: ${error}`));
    }

    render() {
      return (
        <View style={{
          flex: 1,
          paddingTop: 10,
          backgroundColor: '#000',
        }}>
          {this.state.id === '' || this.state.loading ? <Welcome /> : <Aware apiURL={API_URL} id={this.state.id} />}
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
    
  },
});
