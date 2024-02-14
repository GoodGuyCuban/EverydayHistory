import React, { useEffect, useState } from "react";
import { StatusBar } from "expo-status-bar";
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Linking,
} from "react-native";
import API from "./API";

let today = new Date();
let month = String(today.getMonth() + 1).padStart(2, "0");
let day = String(today.getDate()).padStart(2, "0");
let monthWord = today.toLocaleString("default", { month: "long" });
let url = `https://api.wikimedia.org/feed/v1/wikipedia/en/onthisday/all/${month}/${day}`;

async function fetchEvents(url, API) {
  let events = await fetch(url, {
    headers: {
      Authorization: API.token,
      "Api-User-Agent": "EverydayHistory/1.0 (marcos.perezperera@gmail.com)",
    },
  }).then((response) => {
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  });

  console.log(events);
  return events;
}

export default function App() {
  const [eventsList, setEventsList] = useState([]);

  useEffect(() => {
    fetchEvents(url, API).then((events) => {
      let eventsList = [];
      Object.keys(events.selected).forEach((key) => {
        eventsList.push({
          year: events.selected[key].year,
          text: events.selected[key].text,
          pages: events.selected[key].pages,
        });
      });

      setEventsList(eventsList);
    });
  }, []);

  const handlePress = async (url) => {
    const supported = await Linking.canOpenURL(url);

    if (supported) {
      await Linking.openURL(url);
    } else {
      Alert.alert(`Don't know how to open this URL: ${url}`);
    }
  };

  const renderTextWithLinks = (text, pages) => {
    const words = text.split(" ");
    let i = 0;
    const elements = [];
    while (i < words.length) {
      let found = false;
      for (let j = Math.min(i + 4, words.length); j > i; j--) {
        const phrase = words
          .slice(i, j)
          .join("_")
          .replace(/[^a-zA-Z0-9_–-]/g, "");

        const page = pages.find((page) => page.title === phrase);
        if (page) {
          elements.push(
            <Text key={i}>
              <Text
                onPress={() => handlePress(page.content_urls.desktop.page)}
                style={styles.linkText}
              >
                {words.slice(i, j).join(" ")}
              </Text>{" "}
            </Text>
          );
          i = j;
          found = true;
          break;
        }
      }
      if (!found) {
        elements.push(<Text key={i}>{words[i]} </Text>);
        i++;
      }
    }
    return <Text>{elements}</Text>;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.titleText}>Everyday History</Text>

      <View style={styles.container}>
        <Text style={styles.headingText}>
          On {day} of {monthWord} these events happened:
        </Text>

        <FlatList
          data={eventsList}
          renderItem={({ item }) => (
            <View style={styles.item}>
              <Text style={styles.itemHeader}>{item.year}:</Text>
              {renderTextWithLinks(item.text, item.pages)}
            </View>
          )}
        />
      </View>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  titleText: {
    fontSize: 20,
    fontWeight: "bold",
  },
  headingText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  item: {
    padding: 10,
    fontSize: 18,
    height: 44,
  },
  itemHeader: {
    fontSize: 18,
    fontWeight: "bold",
  },
  linkText: {
    color: "blue",
  },
});
