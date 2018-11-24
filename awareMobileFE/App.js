"use strict";
import React from 'react';
import { StyleSheet, View } from 'react-native';
import Camera from './Components/Camera/Camera.js'

export default class App extends React.Component {

    constructor(props) {
        super(props);
        process.nextTick = setImmediate;
    }

    render() {
        return (
                <View style={styles.container}>
                    <View style={styles.camfeed}>
                        <Camera></Camera>
                    </View>
                </View>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        paddingTop: '50%',
 
    },
    camfeed: {
       width: '90%', 
       height: '100%',
       justifyContent: 'center',
       borderRadius: 20,
       overflow: 'hidden'
    },
});
