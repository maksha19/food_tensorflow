
import React, { useEffect } from "react"
import {
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
  StatusBar,
  Image,
  TouchableOpacity,
  ImageSourcePropType
} from 'react-native'

const HomeScreen =({ navigation, route, options, back }:any)=>{

  useEffect(() =>{
    console.log({ navigation, route, options, back })
  },[])

  return(
            <View style={styles.container}>
              {/* <StatusBar barStyle='light-content' /> */}
              <View style={styles.loadingContainer}>
                <Text style={styles.text}>
                  TFJS ready?
                </Text>
                <View style={styles.loadingModelContainer}>
                  <Text style={styles.text}>Model ready? </Text>
                  {
                    <Text style={styles.text}>✅</Text>
                
                 }
                </View>
              </View>      
        
            </View>
          )
  

}


export default HomeScreen


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center'
  },
  loadingContainer: {
    marginTop: 80,
    justifyContent: 'center'
  },
  text: {
    color: '#171f24',
    fontSize: 16
  },
  loadingModelContainer: {
    flexDirection: 'row',
    marginTop: 10
  },
  imageWrapper: {
    width: 280,
    height: 280,
    padding: 10,
    borderColor: '#cf667f',
    borderWidth: 5,
    borderStyle: 'dashed',
    marginTop: 40,
    marginBottom: 10,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center'
  },
  imageContainer: {
    width: 250,
    height: 250,
    position: 'absolute',
    top: 10,
    left: 10,
    bottom: 10,
    right: 10
  },
  predictionWrapper: {
    height: 100,
    width: '100%',
    flexDirection: 'column',
    alignItems: 'center'
  },
  transparentText: {
    color: '#ffffff',
    opacity: 0.7
  },
  footer: {
    marginTop: 40
  },
  poweredBy: {
    fontSize: 20,
    color: '#e69e34',
    marginBottom: 6
  },
  tfLogo: {
    width: 125,
    height: 70
  }
})