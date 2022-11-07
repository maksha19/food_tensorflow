import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  Platform
} from "react-native";
import { EvilIcons } from '@expo/vector-icons';

type StatusTypes = "CATEGORY" | "VIEW" | "ORDER" |  "SUCCESS";
type CategoryTypes = "Dairy" | "Vegies" | "Sweeet" | "Others";
type ItemsValuesTypes = {
  name: string;
  imageUr: string;
  price: number;
  date: string;
  count: number,
  isAdded: boolean
};

const items: Record<string, ItemsValuesTypes[]> = {
  Dairy: [
    {
      name: "Milk",
      imageUr: "https://picsum.photos/id/29/200/300",
      price: 100,
      date: "1/12/2022",
      count: 0,
      isAdded: false
    },
  ],

  Vegies: [
    {
      name: "apple",
      imageUr: "https://picsum.photos/id/28/200/300",
      price: 200,
      date: "2/12/2022",
      count: 0,
      isAdded: false
    },
  ],

  Sweeet: [
    {
      name: "sugar",
      imageUr: "https://picsum.photos/id/2/200/300",
      price: 300,
      date: "3/12/2022",
      count: 0,
      isAdded: false
    },
  ],

  Others: [
    {
      name: "covid mask",
      imageUr: "https://picsum.photos/id/23/200/300",
      price: 400,
      date: "4/12/2022",
      count: 0,
      isAdded: false
    },
    {
      name: "ART kit",
      imageUr: "https://picsum.photos/id/1/200/300",
      price: 401,
      date: "4/12/2022",
      count: 0,
      isAdded: false
    },
    {
      name: "Toys",
      imageUr: "https://picsum.photos/id/7/200/300",
      price: 402,
      date: "4/12/2022",
      count: 0,
      isAdded: false
    },
  ],
};

const categories = ["Dairy", "Vegies", "Sweeet", "Others"];


const ViewsScreen = ({ k, selectedItem, addToCart }: { k: number, selectedItem: ItemsValuesTypes, addToCart: Function }) => {

  const [count, setCount] = useState<number>(0)
  if (selectedItem === undefined) return <></>;
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
            <View style={{ marginRight: 10 }}>
              <Image
                style={{ height: 80, width: 80 }}
                source={{ uri: selectedItem.imageUr }}
              ></Image>
            </View>
            <View style={{ justifyContent: "center" }}>
              <Text>Name: {selectedItem.name}</Text>
              <Text>Price : {selectedItem.price}</Text>
              <Text>Expire Date: {selectedItem.date}</Text>
            </View>
          </View>
          <View
            style={{
              display: "flex",
              flexDirection: "row",
              width: "100%",
            }}
          >
            <View style={{ flex: 0.5, flexDirection: "row", justifyContent: 'space-evenly', alignItems: 'center' }}>
              <TouchableOpacity
                onPress={() => setCount(count - 1)}>
                <TabBarIcon name="minus" color={'#000'} />
              </TouchableOpacity>
              <Text style={[styles.linkText, { color: '#000' }]}>{count}</Text>
              <TouchableOpacity
                onPress={() => setCount(count + 1)}>
                <TabBarIcon name="plus" color={'#000'} />
              </TouchableOpacity>
            </View>
            <View style={{ flex: 0.5, justifyContent: 'center' }}>
              <View>
                <TouchableOpacity
                  onPress={() => addToCart(selectedItem.name, count)}
                  style={[
                    styles.link,
                    {
                      margin: 0,
                      paddingVertical: 0,
                      alignItems: "center",
                      width: "100%",
                    },
                  ]}
                >
                  <Text style={[styles.linkText, { padding: 5 }]}>
                    Add to Cart
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </View>

    </>
  );
};

const OrderScreen = ({ k, orderItem }: { k: number, orderItem: ItemsValuesTypes, }) => {

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
            <View style={{ marginRight: 10 }}>
              <Image
                style={{ height: 80, width: 80 }}
                source={{ uri: orderItem.imageUr }}
              ></Image>
            </View>
            <View style={{ justifyContent: "center" }}>
              <Text>Name : {orderItem.name}</Text>
              <Text>Quntity : {orderItem.count}</Text>
              <Text>Cost : {orderItem.price * orderItem.count}</Text>
              <Text>Expire Date: {orderItem.date}</Text>
            </View>
          </View>
        </View>
      </View>
    </>
  );
};
const PlaceOrder = () => {
  const [currentState, setCurrentState] = useState<StatusTypes>("CATEGORY");
  const [selectedCategory, setSelectedCategory] = useState<
    CategoryTypes | undefined
  >();
  const [ItemsValues, setIteamValues] = useState<ItemsValuesTypes[] | undefined>()
  const [cartList, setCartList] = useState<any>([])
  const [orderItems, setOrderItems] = useState<ItemsValuesTypes[]>([])
  const [time, onChangeTimeText] = React.useState('');

  const categoriesScreen = () => {
    return (
      <>
        {categories.map((v, k) => {
          return (
            <View
              style={{ width: "100%", margin: 20, alignItems: "center" }}
              key={k}
            >
              <TouchableOpacity
                style={styles.cardList}
                key={k}
                onPress={() => itemViewState(v)}
              >
                <View>
                  <Text>{v}</Text>
                </View>
              </TouchableOpacity>
            </View>
          );
        })}
      </>
    );
  };

  const addTocart = (name: string, count: number) => {
    const newCat = {
      name: name,
      count: count
    }
    setCartList((oldCart: any) => {
      return [...oldCart, newCat]
    })
    console.log(cartList)
  }

  const orderViewState = () => {

    const tempCartlist: [] = cartList
    const tempItemsValues = ItemsValues

    const orderItems = tempCartlist.map((item: any) => {
      let tempItem = tempItemsValues?.find((i) => i.name === item.name)
      tempItem && delete tempItem?.count
      return { ...tempItem, ...item }
    })
    setOrderItems(orderItems)
    setCurrentState('ORDER')
  }

  const placeOrder =  ()=> {
    setCurrentState('SUCCESS')
    }


  const itemViewState = (category: CategoryTypes) => {
    setSelectedCategory(category);
    setCurrentState("VIEW");
    setIteamValues(items[category])
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"}
    style={{flex: 1}}>
      <View style={styles.container}>
        {currentState !== "ORDER" && currentState !== "SUCCESS" &&
          <View>
            <TouchableOpacity style={{ width: '100%', marginTop: '-5%', marginRight: '13%', flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'flex-end' }}
              onPress={() => orderViewState()}>
              <Text>View Cart</Text>
              <TabBarIcon name="archive" color={'#000'} />
            </TouchableOpacity>
          </View>}
        {currentState === "CATEGORY" && categoriesScreen()}
        {currentState === "VIEW" &&
          ItemsValues && ItemsValues.length > 0 && (
            <ScrollView style={styles.scrollView} contentContainerStyle={{alignItems:'center'}}>
              {ItemsValues.map((v, k) =>
                <ViewsScreen k={k} selectedItem={v} addToCart={addTocart} />)}
            </ScrollView>
          )
        }
        {
          currentState === "ORDER" && (orderItems && orderItems.length > 0 ? (
            <>
     
             <ScrollView style={styles.scrollView} contentContainerStyle={{alignItems:'center'}}>
                {orderItems.map((v, k) =>
                  <OrderScreen k={k} orderItem={v} />)}
              </ScrollView>
              <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <>
              <Text>
                I would like to pick up my groceries at:
              </Text>
              <TextInput style={styles.input} onChangeText={text=>onChangeTimeText(text)} value={time} />
              </>
              </TouchableWithoutFeedback>

              <TouchableOpacity style={{ backgroundColor: '#f48225', borderRadius: 20 ,margin:10 }}
                onPress={() => placeOrder()}>
                <Text style={styles.linkText}>Place Order</Text>
              </TouchableOpacity>
            
            </>

          ) : (
            <><Text style={[styles.linkText, { color: '#000' }]}>No Item in cart</Text></>
          )
          )
        }
        {
          currentState === "SUCCESS" && <>
          <Text style={[styles.linkText, { color: '#000' }]}>Your Order has beed Placed</Text>
          <Text style={[styles.linkText, { color: '#000' }]}>Please pick up before {time}</Text>
          <Text style={[styles.linkText, { color: '#000' }]}>Thank You! </Text>
          </>
        }
      </View>
    </KeyboardAvoidingView>
  );
};

export default PlaceOrder;

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
    width:150,
    margin: 12,
    borderWidth: 1,
    padding: 10,
  },
});

function TabBarIcon(props: { name: string; color: string }) {
  return <EvilIcons size={30} style={{ marginBottom: -3 }} {...props} />;
}