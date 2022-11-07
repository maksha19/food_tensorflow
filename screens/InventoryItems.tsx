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
  Keyboard,
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
import { useForm, Controller } from 'react-hook-form';
import DropDownPicker from 'react-native-dropdown-picker';

const InventoryItems = () => {

  const [isTfReady, setIsTfReady] = useState(false)
  const [isModelReady, setIsModelReady] = useState(false)
  const [predictions, setPredictions] = useState<DetectedObject[] | undefined>()
  const [totalCount, setTotalCount] = useState(0)
  const [image, setImage] = useState<any>(null)
  const model = useRef<ObjectDetection | null>(null)
  const webref = useRef<WebView | null>(null)
  const [isPredictStart, setIsPredictStart] = useState(false)
  const [isFormSubmitted, setIsFormSubmitted] = useState(false)

  const [categoryOpen, setCategoryOpen] = useState(false);
  const [categoryValue, setCategoryValue] = useState(null);
  const [category, setCategory] = useState([
    { label: "Dairy", value: "Dairy" },
    { label: "Vegies", value: "Vegies" },
    { label: "Sweeet", value: "Sweeet" },
    { label: "Othes", value: "Others" },
  ]);
  const { handleSubmit, control,setValue } = useForm();




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
      setPredictions(predictions)
      let count = 0
      predictions?.forEach(item => {
        if ((Math.round(item.score * 100)) > 50) {
          count++;
        }
      })
      // TODO : get date and price from image 
      setTotalCount(count)
      setIsPredictStart(false)
      setValue('count',count, {shouldValidate:true})
      console.log(predictions)
    } catch (error) {
      console.log('classifyImage error', error)
      setIsPredictStart(false)
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
        setIsPredictStart(true)
        classifyImage(response.uri)
      }
    } catch (error) {
      console.log('selectImage error', error)
      setIsPredictStart(false)
    }
  }

  const renderPrediction = () => {
    return (
      <Text style={styles.text}>
        {totalCount}
      </Text>
    )
  }


  const onSubmit = (data: any) => {
    console.log(data, 'data');
    setIsFormSubmitted(true)
  };

  const onMessage = (args: any) => {
    console.log('INJECTED_JAVASCRIPT', args)
  }
  //   const INJECTED_JAVASCRIPT = `(function() {
  //     window.ReactNativeWebView.postMessage(JSON.stringify({a:'mani'}));
  // })();`;

  const html = `
<html>
    <head>
        <title>Tesseract-JS Demo</title>
		<meta charset="UTF-8">
		<meta name="description" content="A simple demonstration of Tesseract JS">
		<meta name="keywords" content="Tesseract,OCR,JavaScript">
		<meta name="author" content="Akshay Khale">
    </head>
    <body>
        <label for="input_image">Choose an Image File:</label>
        <input type="file" id="input_image" name="input_image"/>
        <br />
        <br />
        <textarea id="image-text"></textarea>
		<br/><br/>
		<progress id="progressbar" min="0" max="1" value="0"/>
    </body>
	<script src='https://cdn.rawgit.com/naptha/tesseract.js/1.0.10/dist/tesseract.js'></script>
    <script>
        document.addEventListener('DOMContentLoaded', function(){
            var input_image = document.getElementById('input_image');
            input_image.addEventListener('change', handleInputChange);
        });

        function handleInputChange(event){
            var input = event.target;
            var file = input.files[0];
            console.log(file);
            Tesseract.recognize(file)
                .progress(function(message){
					document.getElementById('progressbar').value = message.progress;
                    console.log(message);
                })
                .then(function(result){
                    var contentArea = document.getElementById('image-text');
					contentArea.innerHTML = result.text;
                    console.log(result);
                })
                .catch(function(err){
                    console.error(err);
                });
        }
    </script>
</html>
`;


  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}>
      <View style={styles.container}>
        <StatusBar barStyle='light-content' />
        <View style={styles.loadingContainer}>
          <Text style={[styles.text,{marginRight:10}]}>
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
          {/* <View style={styles.predictionWrapper}>
        {isModelReady && image && (
          <Text style={styles.text}>
            Predictions: {predictions ? '' : 'Predicting...'}
          </Text>
        )}
        {isModelReady &&
          totalCount > 0 && renderPrediction()}
      </View> */}
          <View>
            <Text style={styles.label}>Category</Text>
            <Controller
              name="category"
              defaultValue=""
              control={control}
              render={({ field: { onChange, value } }) => (
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
                    onChangeValue={onChange}
                  />
                </View>
              )}
            />

            <Text style={styles.label}>Price</Text>
            <Controller
              name="price"
              defaultValue=""
              control={control}
              render={({ field: { onChange, value } }) => (
                <TextInput
                  style={styles.input}
                  selectionColor={'#5188E3'}
                  onChangeText={onChange}
                  value={value}
                />
              )}
            />

            <Text style={styles.label}>Count</Text>
            <Controller
              name="count"
              defaultValue={totalCount}
              control={control}
              render={({ field: { onChange, value } }) => (
                <TextInput
                  style={styles.input}
                  selectionColor={'#5188E3'}
                  onChangeText={onChange}
                  value={value}
                />
              )}
            />
           <Text style={styles.label}>Expire Date</Text>
            <Controller
              name="expireDate"
              defaultValue=''
              control={control}
              render={({ field: { onChange, value } }) => (
                <TextInput
                  style={styles.input}
                  selectionColor={'#5188E3'}
                  onChangeText={onChange}
                  value={value}
                />
              )}
            />
            <TouchableOpacity style={styles.submitButton} disabled={totalCount===0} onPress={handleSubmit(onSubmit)}>
               <Text style={[styles.text, {color:'#fff', textAlign: 'center' }]}>
                {isPredictStart ? "Predicting...":"Submit"}                
                </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
        <>
          <WebView
            ref={(r) => (webref.current = r)}
            originWhitelist={['*']}
            source={{ html, headers: {} }}
            // injectedJavaScript={INJECTED_JAVASCRIPT}
            onMessage={onMessage}
          />
        </>
      </View>
    </KeyboardAvoidingView>
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