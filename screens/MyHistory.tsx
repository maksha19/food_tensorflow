import React, { useEffect, useState } from "react"
import {
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
  StatusBar,
  Image,
  TouchableOpacity,
  ImageSourcePropType,
  ScrollView
} from 'react-native'
import axios from "axios";
import { ItemsValuesTypes } from "./PlaceOrder";
import { EvilIcons } from '@expo/vector-icons';

type OrderHistoryType = ItemsValuesTypes & { pickupTime: string, orderTime: string }

const OrderScreen = ({ k, orderItem }: { k: number, orderItem: OrderHistoryType }) => {

  if (orderItem === undefined) return <></>;
  return (
    <>
      <View
        style={{ width: "100%", margin: 20, alignItems: "center" }}
        key={k}
      >
        <View
          style={[styles.cardList, { height: 160, padding: 10 }]}
          key={k}
        >
          <View style={{ display: "flex", flexDirection: "row" }}>
            <View style={{ marginRight: 10, alignSelf: 'center' }}>
              <Image
                style={{ height: 80, width: 80 }}
                source={{ uri: orderItem.imageUri }}
              ></Image>
            </View>
            <View style={{ justifyContent: "center" }}>
              <Text style={styles.text}>Name : {orderItem.name}</Text>
              <Text style={styles.text}>Quntity : {orderItem.count}</Text>
              <Text style={styles.text}>Cost :${orderItem.price * orderItem.count}</Text>
              <Text style={styles.text}>Expire Date: {orderItem.expireDate}</Text>
              <Text style={styles.text}>Pickup Time : {orderItem.pickupTime}</Text>
              <Text style={styles.text}>Order Date: {orderItem.orderTime}</Text>
            </View>
          </View>
        </View>
      </View>
    </>
  );
};

const MyHistory = ({ navigation }: any) => {

  const [myHistoryList, setMyHistoryList] = useState<OrderHistoryType[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // get my history list from server
  useEffect(() => {
    getHistoryList()
  }, [])

  const getHistoryList = () => {
    (async () => {
      const url = 'https://script.google.com/macros/s/AKfycbxJd6xQnVujSbXv5dAZjW77mDGZyhbNIFA7wZ-UESbYodtj-lqzPgIiTLLdIze4mvIaKQ/exec'
      const response = await axios.get(
        url,
        {
          headers: {
            "Content-Type": "text/plain;charset=utf-8",
          },
        }
      );
      if (response.status === 200) {
        const statusCode = response.data.statusCode;
        if (statusCode === "201") {
          let historyData: OrderHistoryType[] = []
          const parseData: [] = JSON.parse(response.data.orderItems)

          parseData.map(item => {
            console.log('item: ', item)
            if (item[0] !== '') {
              console.log('iternal parser', JSON.parse(item[0]))
              const orderItem: OrderHistoryType[] = JSON.parse(item[0])['orderItems']
              historyData.push(...orderItem)
            } 
          })
          console.log('historyData', historyData)
          setMyHistoryList(historyData)
        }
      }
      setIsLoading(false)
    })()
  }
  return (
    <View style={styles.container}>
      <View>
        <TouchableOpacity style={{ width: '100%', flexDirection: 'row', }}
          onPress={() => getHistoryList()}>
          <Text style={{ paddingTop: 5 }}>Refresh</Text>
          <TabBarIcon name="refresh" color={'#000'} />
        </TouchableOpacity>
      </View>
      {
        myHistoryList.length > 0 ? (
          <ScrollView style={styles.scrollView} contentContainerStyle={{ alignItems: 'center' }}>
            {myHistoryList.map((v, k) =>
              <OrderScreen k={k} orderItem={v} />)}
          </ScrollView>
        ) :
          isLoading ?
            <>
              <Text style={[styles.linkText, { color: '#000' }]}>Loading...</Text>
            </> :
            <>
              <Text style={[styles.linkText, { color: '#000' }]}>No Items, Please Order</Text>
              <View style={{ justifyContent: 'center' }}>
                <View>
                  <TouchableOpacity
                    onPress={() => navigation.navigate('PlaceOrder')}
                    style={[
                      styles.link,
                      {
                        margin: 5,
                        paddingVertical: 10,
                        alignItems: "center",
                        width: "100%",
                      },
                    ]}
                  >
                    <Text style={[styles.linkText, { padding: 5 }]}>
                      Make Order
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </>


      }

    </View>
  )
}

export default MyHistory


const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 40,
    backgroundColor: "#ecf0f1",
    marginHorizontal: 20,
  },
  scrollView: {
    width: '100%'
  },
  cardList: {
    height: 100,
    width: "90%",
    borderColor: "rgba(0, 0, 0, 0.125)",
    borderWidth: 1,
    borderRadius: 10,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
  },

  paragraph: {
    margin: 24,
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    color: "#34495e",
  },
  link: {
    margin: 20,
    paddingVertical: 15,
    backgroundColor: "#2e78b7",
    borderRadius: 10,
    width: "60%",
  },
  linkText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
    padding: 16,
  },
  input: {
    height: 40,
    width: 150,
    margin: 12,
    borderWidth: 1,
    padding: 10,
  }, text: {
    marginBottom: 2
  }
});

function TabBarIcon(props: { name: string; color: string }) {
  return <EvilIcons size={30} style={{ marginBottom: -3 }} {...props} />;
}