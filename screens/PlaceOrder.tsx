import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  ActivityIndicator,
  StatusBar,
  Image,
  TouchableOpacity,
  ImageSourcePropType,
} from "react-native";
import { Card } from "react-native-elements";

type statusTypes = "CATEGORY" | "VIEW" | "ORDER" | "PAYMENT" | "SUCCESS";
type categoryTypes = "Dairy" | "Vegies" | "Sweeet" | "Others";
type itemsValues = {
  name: string;
  imageUr: string;
  price: number;
  date: string;
};

const items: Record<string, itemsValues[]> = {
  Dairy: [
    {
      name: "Milk",
      imageUr: "",
      price: 100,
      date: "1/12/2022",
    },
  ],

  Vegies: [
    {
      name: "apple",
      imageUr: "",
      price: 200,
      date: "2/12/2022",
    },
  ],

  Sweeet: [
    {
      name: "sugar",
      imageUr: "",
      price: 300,
      date: "3/12/2022",
    },
  ],

  Others: [
    {
      name: "covid mask",
      imageUr: "https://picsum.photos/id/23/200/300",
      price: 400,
      date: "4/12/2022",
    },
    {
      name: "ART kit",
      imageUr: "https://picsum.photos/id/1/200/300",
      price: 401,
      date: "4/12/2022",
    },
  ],
};

const categories = ["Dairy", "Vegies", "Sweeet", "Others"];

const PlaceOrder = () => {
  const [currentState, setCurrentState] = useState<statusTypes>("CATEGORY");
  const [selectedCategory, setSelectedCategory] = useState<
    categoryTypes | undefined
  >();

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

  const viewsScreen = () => {
    if (selectedCategory === undefined) return <></>;

    const selectedCategoryItems = items[selectedCategory];
    return (
      <>
        {selectedCategoryItems.map((v, k) => {
          return (
            <View
              style={{ width: "100%", margin: 20, alignItems: "center" }}
              key={k}
            >
              <TouchableOpacity style={styles.cardList} key={k}>
                <View style={{ display: "flex", flexDirection: "row" }}>
                  <View style={{ marginRight: 10 }}>
                    <Image
                      style={{ height: 80, width: 80 }}
                      source={{ uri: v.imageUr }}
                    ></Image>
                  </View>
                  <View style={{ justifyContent: "center" }}>
                    <Text>Name: {v.name}</Text>
                    <Text>Price : {v.price}</Text>
                    <Text>Expire Date: {v.date}</Text>
                  </View>
                </View>
                <View style={{}}>
                  <TouchableOpacity
                    onPress={() => undefined }
                   style={styles.link}
                  >
                    <Text style={styles.linkText}>
                      add to cart
                    </Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            </View>
          );
        })}
      </>
    );
  };

  const itemViewState = (category: categoryTypes) => {
    setSelectedCategory(category);
    setCurrentState("VIEW");
  };
  return (
    <>
      <View style={styles.container}>
        {currentState === "CATEGORY" && categoriesScreen()}
        {currentState === "VIEW" && viewsScreen()}
      </View>
    </>
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
  },
  cardList: {
    height: 150,
    width: "70%",
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


    backgroundColor: "#2e78b7",
    borderRadius: 5,
    width: "60%",
  },
  linkText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
    padding: 5
  },
});
