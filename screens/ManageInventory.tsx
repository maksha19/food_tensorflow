import { string } from "@tensorflow/tfjs";
import axios from "axios";
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
import { EvilIcons } from '@expo/vector-icons';


type InventoryItemType = {
  categoryValue: string,
  price: string,
  totalCount: string,
  expireDate: string,
  item: string,
  imageUri: string,
}

const InventoryItemScreen = ({ k, orderItem }: { k: number, orderItem: InventoryItemType }) => {

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
          <View key={k} style={{ display: "flex", flexDirection: "row" }}>
            <View style={{ marginRight: 10, alignSelf: 'center' }}>
              <Image
                style={{ height: 80, width: 80 }}
                source={{ uri: orderItem.imageUri }}
              ></Image>
            </View>
            <View style={{ justifyContent: "center" }}>
              <Text style={styles.text}>Name : {orderItem.item}</Text>
              <Text style={styles.text}>Available Quntity : {orderItem.totalCount}</Text>
              <Text style={styles.text}>Cost : {orderItem.price}</Text>
              <Text style={styles.text}>Expire Date : {orderItem.expireDate}</Text>
            </View>
          </View>
        </View>
      </View>
    </>
  );
};



const ManageInventory = ({ navigation }: any) => {

  const [inventoryItems, setInventoryItems] = useState<InventoryItemType[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // get Inventory list from server
  useEffect(() => {
    getInventoryList()
  }, [])

  const getInventoryList = () => {
    (async () => {
      const url = 'https://script.google.com/macros/s/AKfycbzg4fb5RP-Y_b4RaOdy2r18pxMq6RPPpLTGsUlyUBUdC4nYVNZp23G292C3Il4MK4VGYQ/exec'
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
          let inventotyData: InventoryItemType[] = []
          const parseData: [] = JSON.parse(response.data.inventoryItems)

          parseData.map(item => {
            console.log('item: ', item)
            if(item[0]!==''){
              const inventoryItem: InventoryItemType = JSON.parse(item[0])
              inventotyData.push(inventoryItem)
            }
        
          })
          console.log('inventoryData', inventotyData)
          setInventoryItems(inventotyData)
        }
      }
      setIsLoading(false)
    })()
  }

  return (
    <View style={styles.container}>
      <View>
        <TouchableOpacity style={{ width: '100%', flexDirection: 'row', }}
          onPress={() => getInventoryList()}>
          <Text style={{ paddingTop: 5 }}>Refresh</Text>
          <TabBarIcon name="refresh" color={'#000'} />
        </TouchableOpacity>
      </View>
      {
        inventoryItems.length > 0 ? (
          <ScrollView style={styles.scrollView} contentContainerStyle={{ alignItems: 'center' }}>
            {inventoryItems.map((v, k) =>
              <InventoryItemScreen k={k} orderItem={v} />)}
          </ScrollView>
        ) : 
       !isLoading ?   <>
            <Text style={[styles.linkText, { color: '#000' }]}>No Inventories</Text>
            <View style={{ justifyContent: 'center' }}>
              <View>
                <TouchableOpacity
                  onPress={() => navigation.navigate('InventoryItems')}
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
                    Add Item
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </> :
          <>
           <Text style={[styles.linkText, { color: '#000' }]}>Loading...</Text>
          </>
        
        
      }
    </View>
  )
}

export default ManageInventory

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
  },
  text: {
    marginBottom: 5
  }
});

function TabBarIcon(props: { name: string; color: string }) {
  return <EvilIcons size={30} style={{ marginBottom: -3 }} {...props} />;
}