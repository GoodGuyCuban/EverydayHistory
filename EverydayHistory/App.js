// Import necessary modules from react, react-native and expo-status-bar
import React, { useEffect, useState } from "react";
import { StatusBar } from "expo-status-bar";
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Linking,
  SafeAreaView,
  Image,
  Apperance,
  useColorScheme,
} from "react-native";
import API from "./API"; // Import API configuration

// Get today's date and format it
let today = new Date();
let month = String(today.getMonth() + 1).padStart(2, "0");
let day = String(today.getDate()).padStart(2, "0");
let monthWord = today.toLocaleString("default", { month: "long" });
let url = `https://api.wikimedia.org/feed/v1/wikipedia/en/onthisday/all/${month}/${day}`;

// Function to fetch events from the API
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

  return events;
}

// Main App component
export default function App() {
  const [eventsList, setEventsList] = useState([]); // State to hold the list of events

  // Fetch events on component mount
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

      setEventsList(eventsList); // Update the state with the fetched events
    });
  }, []);

  // Function to handle link press
  const handlePress = async (url) => {
    const supported = await Linking.canOpenURL(url);

    if (supported) {
      await Linking.openURL(url);
    } else {
      Alert.alert(`Don't know how to open this URL: ${url}`);
    }
  };

  // Function to render text with links
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
          .replace(/[^a-zA-Z0-9_–'-]/g, "");

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
          if (page.thumbnail) {
            lastPageWithThumbnail = page;
          }
          break;
        }
      }
      if (!found) {
        elements.push(<Text key={i}>{words[i]} </Text>);
        i++;
      }
    }

    return <Text style={styles.baseText}>{elements}</Text>;
  };

  // Function to render image
  const renderImage = (pages, text) => {
    let pageWithThumbnail;
    if (text.match(/\bwar(s)?\b[:]?/gi)) {
      pageWithThumbnail = pages.reverse().find((page) => page.thumbnail);
    } else {
      pageWithThumbnail = pages.find((page) => page.thumbnail);
    }

    if (pageWithThumbnail) {
      return (
        <Image
          key={pageWithThumbnail.pageid}
          source={{ uri: pageWithThumbnail.thumbnail.source }}
          style={styles.Image}
          resizeMode="contain"
        />
      );
    }
    return null;
  };

  // Function to get day with suffix
  const getDayWithSuffix = (day) => {
    if (day % 10 === 1 && day !== 11) {
      return `${day}st`;
    } else if (day % 10 === 2 && day !== 12) {
      return `${day}nd`;
    } else if (day % 10 === 3 && day !== 13) {
      return `${day}rd`;
    } else {
      return `${day}th`;
    }
  };

  // Get the color scheme for the device
  const colorScheme = useColorScheme();
  console.log(colorScheme);
  const styles = colorScheme === "dark" ? darkStyles : lightStyles;

  // Render the App component
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topBar}>
        <Text style={styles.titleText}>Everyday History</Text>
        <Text style={styles.headingText}>
          On the {getDayWithSuffix(day)} of {monthWord},
        </Text>
      </View>
      <View style={styles.container}>
        <FlatList
          contentContainerStyle={{
            padding: 20,
          }}
          data={eventsList}
          renderItem={({ item }) => (
            <View style={styles.item}>
              <Text style={styles.itemHeader}>{item.year}:</Text>
              {renderTextWithLinks(item.text, item.pages)}
              {renderImage(item.pages, item.text)}
            </View>
          )}
        />
      </View>
      <StatusBar style="auto" />
    </SafeAreaView>
  );
}

// Base styles
const baseStyles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "stretch",
    justifyContent: "center",
    width: "100%",
  },
  topBar: {
    alignItems: "center",
    width: "100%",
  },
  titleText: {
    fontSize: 20,
    fontWeight: "bold",
    margin: 5,
  },
  headingText: {
    fontSize: 16,
    fontWeight: "bold",
    margin: 5,
  },
  item: {
    padding: 10,
    margin: 10,
    fontSize: 18,
    borderColor: "black",
    borderWidth: 1,
    borderRadius: 5,
  },
  itemHeader: {
    fontSize: 18,
    fontWeight: "bold",
  },
  linkText: {
    color: "blue",
  },
  Image: {
    width: 300,
    height: 200,
    alignSelf: "center",
    margin: 10,
  },
  baseText: {
    fontSize: 14,
  },
});

// Light styles
const lightStyles = StyleSheet.create({
  ...baseStyles,
  container: {
    ...baseStyles.container,
    backgroundColor: "#fff",
  },
  topBar: {
    ...baseStyles.topBar,
    backgroundColor: "white",
    borderBottomColor: "black",
    borderBottomWidth: 1,
  },
});

// Dark styles
const darkStyles = StyleSheet.create({
  ...baseStyles,
  container: {
    ...baseStyles.container,
    backgroundColor: "#121212",
  },
  topBar: {
    ...baseStyles.topBar,
    backgroundColor: "#121212",
    borderBottomColor: "white",
    borderBottomWidth: 1,
  },
  titleText: {
    ...baseStyles.titleText,
    color: "white",
  },
  headingText: {
    ...baseStyles.headingText,
    color: "white",
  },
  item: {
    ...baseStyles.item,
    backgroundColor: "#121212",
    borderColor: "white",
  },
  itemHeader: {
    ...baseStyles.itemHeader,
    color: "white",
  },
  linkText: {
    ...baseStyles.linkText,
    color: "lightblue",
  },
  Image: {
    ...baseStyles.Image,
    borderColor: "white",
  },
  baseText: {
    ...baseStyles.baseText,
    color: "white",
  },
});
