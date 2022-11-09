import React, { useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
} from "react-native";

const HomeScreen = ({ navigation }: any) => {
  const moveToScreen = (user: string) => {
    if (user === "beneficiary") {
      navigation.push("Beneficiary");
    } else {
      navigation.push("Merchant");
    }
  };

  return (
    <View style={styles.container}>
      {/* <StatusBar barStyle='light-content' /> */}
      <TouchableOpacity
        onPress={() =>moveToScreen("Merchant")}
        style={styles.link}
      >
        <Text style={styles.linkText}>Go to Merchant Screen </Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() =>moveToScreen("beneficiary")}
        style={styles.link}
      >
        <Text style={styles.linkText}>Go to Beneficiary Screen</Text>
      </TouchableOpacity>
    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    color: "#171f24",
    fontSize: 16,
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
    padding: 16
  },
});
