import React, { useEffect, useRef, useState } from "react"
import {
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
  StatusBar,
  Image,
  TouchableOpacity,
  TextInput,
  Platform,
  ScrollView,
  KeyboardAvoidingView,
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
import { WebView } from 'react-native-webview'
import DropDownPicker from 'react-native-dropdown-picker';
import Toast from 'react-native-toast-message';
import axios from "axios";

const InventoryItems = () => {

  const [isTfReady, setIsTfReady] = useState(false)
  const [isModelReady, setIsModelReady] = useState(false)
  // const [predictions, setPredictions] = useState<DetectedObject[] | undefined>()

  const [image, setImage] = useState<any>(null)
  const model = useRef<ObjectDetection | null>(null)
  const webref = useRef<WebView | null>(null)
  const [isCocoPredictStart, setIsCocoPredictStart] = useState(false)
  const [isTesseractPredictStart,setIsTesseractPredictStart] = useState(false)

  const [categoryOpen, setCategoryOpen] = useState(false);
  const [category, setCategory] = useState([
    { label: "Dairy", value: "Dairy" },
    { label: "Vegies", value: "Vegies" },
    { label: "Sweeet", value: "Sweeet" },
    { label: "Othes", value: "Others" },
  ]);

  const [categoryValue, setCategoryValue] = useState<string | null>(null);
  const [itemClass, setItemClass] = useState('')
  const [price, setPrice] = useState('')
  const [totalCount, setTotalCount] = useState('0')
  const [expireDate, setExpireDate] = useState('')


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

  const classifyImage = async (uri: any) => {
    try {
      const imageAssetPath = Image.resolveAssetSource(image)
      const response = await fetch(uri, {}, { isBinary: true })
      const rawImageData = await response.arrayBuffer()
      const imageTensor = imageToTensor(rawImageData)
      const predictions = await model.current?.detect(imageTensor)
      // setPredictions(predictions)
      let count = 0
      predictions?.forEach(item => {
        if ((Math.round(item.score * 100)) > 50) {
          count++;
        }
      })
      setTotalCount(count.toString())
      setIsCocoPredictStart(false)
      console.log(predictions)
      if (predictions && predictions?.length > 0) {
        setItemClass(predictions[0].class)
      }
    } catch (error) {
      console.log('classifyImage error', error)
      setIsCocoPredictStart(false)
    }
  }

  const selectImage = async () => {
    try {
      let response = await ImagePicker.launchImageLibraryAsync({
        base64: true,
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsEditing: true,
        aspect: [4, 3]
      })

      if (!response.cancelled) {
        const source = { uri: response.uri }
        setImage(source)
        setIsCocoPredictStart(true)
        classifyImage(response.uri)

        // to get expireDate and price information from tesseract model
        const imageBabe64 = `data:image/jpg;base64,${response.base64}`
        webref.current?.injectJavaScript(
          getInjectableJSMessage(imageBabe64)
        );
      }
    } catch (error) {
      console.log('selectImage error', error)
      setIsCocoPredictStart(false)
    }
  }

  function getInjectableJSMessage(message: any) {
    return `
      (function() {
        document.dispatchEvent(new MessageEvent('message', {
          data: ${JSON.stringify(message)}
        }));
      })();
    `;
  }


  const onSubmit = async () => {
    console.log({ categoryValue, price, totalCount, expireDate, item: itemClass }, 'data');


    const url =
      "https://script.google.com/macros/s/AKfycbyiGvUENeo-vPuKF_YFJ5b0Ht5r7MEFgwrGRvWpsD-_plf1zdDcDdnLknvRlAc9vNM-GQ/exec";
    const response = await axios.post(
      url,
      { categoryValue, price, totalCount, expireDate, item: itemClass },
      {
        headers: {
          "Content-Type": "text/plain;charset=utf-8",
        },
      }
    );
    if (response.status === 200) {
      const statusCode = response.data.statusCode;
      if (statusCode === "201") {
        Toast.show({
          type: 'success',
          text1: '👋  Iventory Saved Successfully ',
        });  
        setTimeout(() => {
          setCategoryValue(null)
          setItemClass('')
          setPrice('')
          setTotalCount('0')
          setExpireDate('')
          setImage(null)
        }, 1000)

      }}


  };

  const onMessage = (event: any) => {
    const data: string = event.nativeEvent.data.toString()
    data.split("\\n").forEach((v: string) => {
      console.log('v', v)
      const item = v.split(':')
      console.log('item', item)
      if (item && item[0].toUpperCase().includes('EXPIRE')) {
        console.log('expire', item)
        setExpireDate(item[1].trim())
      }
      if (item && item[0].toUpperCase().includes('PRICE')) {
        console.log('expire', item)
        setPrice(item[1].trim())
      }
    })
    setIsTesseractPredictStart(true)
    // console.log('INJECTED_JAVASCRIPT', event.nativeEvent.data)
  }


  const html = `
<html>
    <head>
        <title>food</title>
		<meta charset="UTF-8">
		<meta name="description" content="A simple demonstration of Tesseract JS">
		<meta name="keywords" content="Tesseract,OCR,JavaScript">
		<meta name="author" content="Akshay Khale">
    </head>
    <style>
body {
  display: flex;
  height: "100vh";
  justify-content: center;
  align-items: center;
  font-size: "12000px";
}

div {
  transform: scale(1);
}
label{
  size: 50px;
}
</style>
    <body>
    <div id="input_image_div">
        <label for="input_image">Choose an Image File:</label>
         <input id="input_image" type="file" name="input_image"/>

		<br/><br/>
		<progress id="progressbar" min="0" max="1" value="0"/>
    </div>
    </body>
	<script src='https://cdn.rawgit.com/naptha/tesseract.js/1.0.10/dist/tesseract.js'></script>
    <script>
    function handleEvent(message) {
      Tesseract.recognize(message.data)
      .progress(function(message){
        document.getElementById('progressbar').value = message.progress;
          console.log(message);
      })
      .then(function(result){
          window.ReactNativeWebView.postMessage(JSON.stringify(result.text));
      })
      .catch(function(err){
          console.error(err);
      });
   }
   document.addEventListener("message", handleEvent);
    </script>
</html>
`;


  return (
    <>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}>

        <View style={styles.container}>
          <StatusBar barStyle='light-content' />
          <View style={styles.loadingContainer}>
            <Text style={[styles.text, { marginRight: 10 }]}>
              AI Engine ready? {isTfReady ? <Text>✅</Text> : ''}
            </Text>
            <Text style={styles.text}>Model ready? </Text>
            {isModelReady ? (
              <Text style={styles.text}>✅</Text>
            ) : (
              <ActivityIndicator size='small' />
            )}
          </View>

          <ScrollView style={styles.scrollView} contentContainerStyle={{ alignItems: 'center' }}>
            <TouchableOpacity
              style={styles.imageWrapper}
              onPress={isModelReady ? selectImage : undefined}>
              {image && <Image source={image} style={styles.imageContainer} />}

              {isModelReady && !image && (
                <Text style={styles.transparentText}>Tap to choose image</Text>
              )}
            </TouchableOpacity>

            <View>
              <View style={{ height: '0.5%' }}>
                <WebView
                  ref={ref => webref.current = ref}
                  automaticallyAdjustContentInsets={false}
                  source={{ html }}
                  onMessage={onMessage}
                />
              </View>
              <Text style={styles.label}>Category</Text>
              <View style={styles.dropdownCategory}>
                <DropDownPicker
                  style={styles.dropdown}
                  open={categoryOpen}
                  value={categoryValue}
                  items={category}
                  setOpen={setCategoryOpen}
                  setValue={setCategoryValue}
                  setItems={setCategory}
                  placeholder="Select Category"
                  placeholderStyle={styles.placeholderStyles}
                  onChangeValue={text => setCategoryValue(text)}
                />
              </View>
              <Text style={styles.label}>Item</Text>
              <TextInput
                style={styles.input}
                selectionColor={'#5188E3'}
                onChangeText={text => setItemClass(text)}
                value={itemClass}
              />
              <Text style={styles.label}>Price</Text>
              <TextInput
                style={styles.input}
                selectionColor={'#5188E3'}
                onChangeText={text => setPrice(text)}
                value={price}
              />
              <Text style={styles.label}>Count</Text>
              <TextInput
                style={styles.input}
                selectionColor={'#5188E3'}
                onChangeText={text => setTotalCount(text)}
                value={totalCount}
              />
              <Text style={styles.label}>Expire Date</Text>
              <TextInput
                style={styles.input}
                selectionColor={'#5188E3'}
                onChangeText={text => setExpireDate(text)}
                value={expireDate}
              />
              <TouchableOpacity style={styles.submitButton} disabled={parseInt(totalCount) === 0} onPress={onSubmit}>
                <Text style={[styles.text, { color: '#fff', textAlign: 'center' }]}>
                  {isCocoPredictStart && isTesseractPredictStart ? "Predicting..." : "Submit"}
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
        <Toast
          position='bottom'
          bottomOffset={30}
        />
      </KeyboardAvoidingView>
    </>
  )
}

export default InventoryItems


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flexDirection: 'row',
    marginTop: 8,
    justifyContent: 'center'
  },
  text: {
    color: '#171f24',
    fontSize: 16
  },
  imageWrapper: {
    width: 250,
    height: 250,
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
    width: 220,
    height: 220,
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
  },
  label: {
    marginBottom: 7,
    marginStart: 10,
  },
  dropdown: {
    borderColor: '#B7B7B7',
    height: 45,
  },
  dropdownCategory: {
    marginHorizontal: 10,
    width: '50%',
    marginBottom: 12,
    zIndex: 3000,
    zIndexInverse: 1000
  },
  placeholderStyles: {
    color: 'grey',
  },
  input: {
    borderStyle: 'solid',
    borderColor: '#B7B7B7',
    borderRadius: 7,
    borderWidth: 1,
    fontSize: 15,
    height: 45,
    marginHorizontal: 10,
    paddingStart: 10,
    marginBottom: 12,
  },
  submitButton: {
    backgroundColor: '#5188E3',
    marginHorizontal: 50,
    paddingVertical: 15,
    borderRadius: 10,
    marginTop: 10,
  },
  scrollView: {
    width: '100%'
  },

})



// apple , orange , carrot , broccoli , cake