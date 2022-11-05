import React, { useEffect, useRef, useState } from "react"
import {
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
  StatusBar,
  Image,
  TouchableOpacity,
} from 'react-native'
import * as tf from '@tensorflow/tfjs'
import { fetch } from '@tensorflow/tfjs-react-native'
import * as cocossd from "@tensorflow-models/coco-ssd";
import * as jpeg from 'jpeg-js'
import * as ImagePicker from 'expo-image-picker'
import Constants from 'expo-constants'
import * as Permissions from 'expo-permissions'
import { MEDIA_LIBRARY } from 'expo-permissions'
import { DetectedObject, ObjectDetection } from "@tensorflow-models/coco-ssd";

const InventoryItems = () => {

  const [isTfReady, setIsTfReady] = useState(false)
  const [isModelReady, setIsModelReady] = useState(false)
  const [predictions, setPredictions] = useState<DetectedObject[] | undefined>()
  const [totalCount, setTotalCount] = useState(0)
  const [image, setImage] = useState<any>(null)
  const model = useRef<ObjectDetection | null>(null)

  useEffect(() => {
    (async () => {
      await tf.ready()
      setIsTfReady(true)
      model.current = await cocossd.load()
      setIsModelReady(true)

      if (Constants.platform?.ios) {
        const { status } = await Permissions.askAsync(MEDIA_LIBRARY)
        if (status !== 'granted') {
          alert('Sorry, we need camera roll permissions to make this work!')
        }
      }

    })()
  }, [])

  const imageToTensor = (rawImageData: any) => {
    const { width, height, data } = jpeg.decode(rawImageData, { useTArray: true })
    // Drop the alpha channel info for mobilenet
    const buffer = new Uint8Array(width * height * 3)
    let offset = 0 // offset into original data
    for (let i = 0; i < buffer.length; i += 3) {
      buffer[i] = data[offset]
      buffer[i + 1] = data[offset + 1]
      buffer[i + 2] = data[offset + 2]
      offset += 4
    }
    return tf.tensor3d(buffer, [height, width, 3])
  }

  const classifyImage = async (uri:any) => {
    try {
      const imageAssetPath = Image.resolveAssetSource(image)
      const response = await fetch(uri, {}, { isBinary: true })
      const rawImageData = await response.arrayBuffer()
      const imageTensor = imageToTensor(rawImageData)
      const predictions = await model.current?.detect(imageTensor)
      setPredictions(predictions)
      let count = 0
      predictions?.forEach(item => {
        if ((Math.round(item.score * 100)) > 50) {
          count++;
        }
      })
      setTotalCount(count)
      console.log(predictions)
    } catch (error) {
      console.log('classifyImage error', error)
    }
  }

  const selectImage = async () => {
    try {
      let response = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsEditing: true,
        aspect: [4, 3]
      })

      if (!response.cancelled) {
        const source = { uri: response.uri }
        console.log('source', source)
        setImage(source)
        classifyImage(response.uri)
      }
    } catch (error) {
      console.log('selectImage error', error)
    }
  }

  const renderPrediction = () => {
    return (
      <Text style={styles.text}>
        {totalCount}
      </Text>
    )
  }


  return (
    <View style={styles.container}>
      <StatusBar barStyle='light-content' />
      <View style={styles.loadingContainer}>
        <Text style={styles.text}>
          TFJS ready? {isTfReady ? <Text>✅</Text> : ''}
        </Text>

        <View style={styles.loadingModelContainer}>
          <Text style={styles.text}>Model ready? </Text>
          {isModelReady ? (
            <Text style={styles.text}>✅</Text>
          ) : (
            <ActivityIndicator size='small' />
          )}
        </View>
      </View>
      <TouchableOpacity
        style={styles.imageWrapper}
        onPress={isModelReady ? selectImage : undefined}>
        {image && <Image source={image} style={styles.imageContainer} />}

        {isModelReady && !image && (
          <Text style={styles.transparentText}>Tap to choose image</Text>
        )}
      </TouchableOpacity>
      <View style={styles.predictionWrapper}>
        {isModelReady && image && (
          <Text style={styles.text}>
            Predictions: {predictions ? '' : 'Predicting...'}
          </Text>
        )}
        {isModelReady &&
          totalCount > 0 && renderPrediction()}
      </View>
    </View>
  )
}

export default InventoryItems


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



// apple , orange , carrot , broccoli , cake