import { StatusBar } from "expo-status-bar";
import {
  Button,
  StyleSheet,
  Text,
  View,
  Image,
  FlatList,
  Alert,
} from "react-native";
import MyButton from "../components/MyButton";
import axios from "axios";
import React, { useEffect, useState } from "react";
import GameItem from "../components/gameItem";
import OnlineGameItem from "../components/onlineGameItem";
import * as SQLite from "expo-sqlite";
import Modal from "react-native-modal";
// import AnimatedLoader from "react-native-animated-loader";
import LottieView from "lottie-react-native";
// const ip = "http://192.168.76.177:3000";
const ip = "https://supernovabackend.onrender.com";
const db = SQLite.openDatabase("games.db");

async function getGames() {
  // axios
  //   .get("http://" + ip + ":3000/game")
  //   .then((response) => {
  //     //   console.log(response.data);
  //     return response.data;
  //   })
  //   .catch((error) => {
  //     console.log(error);
  //   });

  let games = await new Promise((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        "SELECT * FROM game;",
        [],
        (tx, results) => {
          // console.log("result ", results["rows"]["_array"]);
          resolve(results["rows"]["_array"]);
        },
        (tx, error) => {
          console.log(error);
          reject(error);
        }
      );
    });
  });
  // console.log(games);

  return games;
}

const ViewGames = ({ navigation, route }) => {
  const [games, setGames] = React.useState([]);
  const [isModalVisible, setModalVisible] = React.useState(false);
  const [onlineGames, setOnlineGames] = React.useState([]);
  const [isVisible, setIsVisible] = React.useState(false);

  const isAdmin = route.params.isAdmin;
  function toggleModal() {
    setModalVisible(!isModalVisible);
  }
  const onScreenLoad = async () => {
    try {
      let unsortedGames = await getGames();
      let sortedGames = unsortedGames.sort((a, b) => {
        let timestamp = a.timestamp;
        let year = timestamp.substring(0, 4);
        let month = timestamp.split("-")[1];
        let day = timestamp.split("-")[2];
        day = day.split(" ")[0];
        let time = timestamp.split(" ")[1];
        let hour = time.split(":")[0];
        let minute = time.split(":")[1];
        let second = time.split(":")[2];
        let timeStamp = new Date(year, month - 1, day, hour, minute, second);

        let timestamp2 = b.timestamp;
        let year2 = timestamp2.substring(0, 4);
        let month2 = timestamp2.split("-")[1];
        let day2 = timestamp2.split("-")[2];
        day2 = day2.split(" ")[0];
        let time2 = timestamp2.split(" ")[1];
        let hour2 = time2.split(":")[0];
        let minute2 = time2.split(":")[1];
        let second2 = time2.split(":")[2];
        let timeStamp2 = new Date(
          year2,
          month2 - 1,
          day2,
          hour2,
          minute2,
          second2
        );

        return timeStamp2 - timeStamp;
      });
      // console.log(sortedGames);

      setGames(sortedGames);
    } catch (err) {
      console.log(err);
    }

    // db.exec([{ sql: "PRAGMA foreign_keys = OFF;", args: [] }], false, () =>
    //   console.log("Foreign keys turned on")
    // );
  };
  useEffect(() => {
    onScreenLoad();
  }, []);

  const deleteItemHandler = async (item) => {
    let year = item.timestamp.substring(0, 4);
    let month = item.timestamp.split("-")[1];
    let day = item.timestamp.split("-")[2];
    day = day.split(" ")[0];

    let time = item.timestamp.split(" ")[1];
    let hour = time.split(":")[0];
    let minute = time.split(":")[1];
    let second = time.split(":")[2];

    let date = new Date(year, month - 1, day, hour, minute, second);
    let axiosDate = new Date(year, month - 1, day, hour, minute, second);
    axiosDate.setHours(axiosDate.getHours() - 2);
    // console.log("hi", date);
    let timestampStr =
      date.getFullYear() +
      "-" +
      (date.getMonth() + 1) +
      "-" +
      date.getDate() +
      " " +
      date.getHours() +
      ":" +
      date.getMinutes() +
      ":" +
      date.getSeconds();

    let axiosTimestampStr =
      axiosDate.getFullYear() +
      "-" +
      (axiosDate.getMonth() + 1) +
      "-" +
      axiosDate.getDate() +
      " " +
      axiosDate.getHours() +
      ":" +
      axiosDate.getMinutes() +
      ":" +
      axiosDate.getSeconds();

    // axios
    //   .delete(ip + "/game/" + item.opponent + "/" + axiosTimestampStr)
    //   .then((response) => {
    //     // console.log(response.data);
    //     onScreenLoad();
    //   })
    //   .catch((error) => {
    //     console.log(error);
    //   });

    await db.transaction((tx) => {
      tx.executeSql(
        "DELETE FROM game WHERE opponent=? AND timestamp=?;",
        [item.opponent, timestampStr],
        (tx, results) => {
          // console.log(results);
        },
        (tx, error) => {
          console.log(error);
        }
      );
    });
    await db.transaction((tx) => {
      tx.executeSql(
        "DELETE FROM actionPerformed WHERE opponent=? AND gameTimestamp=?;",
        [item.opponent, timestampStr],
        (tx, results) => {
          // console.log(results);
        },
        (tx, error) => {
          console.log(error);
        }
      );
    });
    onScreenLoad();
  };

  const [swipeableRow, setSwipeableRow] = React.useState([]);
  const [prevOpenedRow, setPrevOpenedRow] = React.useState(null);
  function seeOnlineGames() {
    setIsVisible(true);
    axios
      .get(ip + "/game")
      .then((response) => {
        // console.log(response.data);
        let onlineGames = response.data;
        //see if game is already in local db
        let onlineGamesCopy = [];
        onlineGames.forEach((game) => {
          let date = new Date(game.timestamp);
          let opponent = game.opponent;
          let timestampStr =
            date.getFullYear() +
            "-" +
            (date.getMonth() + 1) +
            "-" +
            date.getDate() +
            " " +
            date.getHours() +
            ":" +
            date.getMinutes() +
            ":" +
            date.getSeconds();
          let gameExists = false;
          games.forEach((localGame) => {
            if (
              localGame.opponent == opponent &&
              localGame.timestamp == timestampStr
            ) {
              gameExists = true;
            }
          });
          if (gameExists) {
            game["color"] = "#0f0";
            onlineGamesCopy.push(game);
          } else {
            game["color"] = "#f00";
            onlineGamesCopy.push(game);
          }
        });

        setOnlineGames(onlineGamesCopy);
        setIsVisible(false);
      })
      .catch((error) => {
        console.log(error);
        setIsVisible(false);
        Alert.alert(
          "Error",
          "Could not connect to server. Please try again later."
        );
      });
    toggleModal();
  }

  async function downloadGame(game) {
    // console.log("game", game);
    let date = new Date(game.timestamp);
    let timestampStr =
      date.getFullYear() +
      "-" +
      (date.getMonth() + 1) +
      "-" +
      date.getDate() +
      " " +
      date.getHours() +
      ":" +
      date.getMinutes() +
      ":" +
      date.getSeconds();
    let onlineDate = new Date(game.timestamp);
    onlineDate.setHours(onlineDate.getHours() - 2);
    let onlineTimestampStr =
      onlineDate.getFullYear() +
      "-" +
      (onlineDate.getMonth() + 1) +
      "-" +
      onlineDate.getDate() +
      " " +
      onlineDate.getHours() +
      ":" +
      onlineDate.getMinutes() +
      ":" +
      onlineDate.getSeconds();

    setIsVisible(true);

    // console.log("timestamp", timestampStr);

    let onlineActionPerformed = await axios
      .get(
        ip +
          "/gameActions/?timestamp=" +
          onlineTimestampStr +
          "&opponent=" +
          game.opponent
      )
      .then((response) => {
        // console.log("res", response.data);
        return response.data;
      })
      .catch((error) => {
        console.log(error);
        setIsVisible(false);
        Alert.alert(
          "Error",
          "Could not connect to server. Please try again later."
        );
      });
    // setIsVisible(false);

    // first delete game if it already exists
    await db.transaction((tx) => {
      tx.executeSql(
        "DELETE FROM game WHERE opponent=? AND timestamp=?;",
        [game.opponent, timestampStr],
        (tx, results) => {
          // console.log(results);
        },
        (tx, error) => {
          console.log(error);
          setIsVisible(false);
          Alert.alert(
            "Error",
            "Could not connect to server. Please try again later."
          );
        }
      );
    });

    // delete actionPerformed in game
    await db.transaction((tx) => {
      tx.executeSql(
        "DELETE FROM actionPerformed WHERE gameTimestamp=? AND opponent=?;",
        [timestampStr, game.opponent],
        (tx, results) => {
          // console.log(results);
        },
        (tx, error) => {
          console.log(error);
          setIsVisible(false);
          Alert.alert(
            "Error",
            "Could not connect to server. Please try again later."
          );
        }
      );
    });

    // Insert game
    await db.transaction((tx) => {
      tx.executeSql(
        `
        INSERT INTO game (opponent, timestamp, myScore, theirScore, home, category, startOffence) VALUES (?, ?, ?, ?, ?, ?, ?);
        `,
        [
          game.opponent,
          timestampStr,
          game.myScore,
          game.theirScore,
          game.home,
          game.category,
          game.startOffence,
        ],
        (tx, results) => {
          // console.log(results);
        },
        (tx, error) => {
          console.log(error);
          setIsVisible(false);
          Alert.alert(
            "Error",
            "Could not connect to server. Please try again later."
          );
        }
      );
    });

    // insert actionPerformed
    let values = "";
    for (let i = 0; i < onlineActionPerformed.length; i++) {
      let action = onlineActionPerformed[i];
      values += "('" + action.opponent + "','" + timestampStr;
      if (action.playerName !== null) {
        values += "','" + action.playerName + "','";
      } else {
        values += "',null,'";
      }
      values += action.action + "','" + action.point;
      if (action.associatedPlayer !== null) {
        values += "','" + action.associatedPlayer + "',";
      } else {
        values += "',null,";
      }
      if (action.offence !== null) {
        values += "'" + action.offence + "'),";
      } else {
        values += "null),";
      }
    }
    values = values.slice(0, -1);

    await db.transaction((tx) => {
      tx.executeSql(
        "INSERT INTO actionPerformed (opponent, gameTimestamp, playerName, action, point, associatedPlayer, offence) VALUES " +
          values +
          ";",
        [],
        (tx, results) => {
          // console.log(results);
        },
        (tx, error) => {
          console.log(error);
          setIsVisible(false);
          Alert.alert(
            "Error",
            "Could not connect to server. Please try again later."
          );
        }
      );
    });

    setIsVisible(false);
    setModalVisible(false);
    onScreenLoad();
  }

  function checkDownloadGame(game) {
    // check if game already exists
    let onlineTimestamp = game.timestamp;
    let date = new Date(onlineTimestamp);
    let onlineGameTimestamp =
      date.getFullYear() +
      "-" +
      (date.getMonth() + 1) +
      "-" +
      date.getDate() +
      " " +
      date.getHours() +
      ":" +
      date.getMinutes() +
      ":" +
      date.getSeconds();
    let found = false;
    for (let i = 0; i < games.length; i++) {
      let localTimestamp = games[i].timestamp;
      if (localTimestamp === onlineGameTimestamp) {
        found = true;
      }
    }
    if (!found) {
      if (game.myScore === -1 || game.theirScore === -1) {
        Alert.alert(
          "Warning",
          "This game still has no actions, it cannot be downloaded."
        );
      } else {
        downloadGame(game);
      }
    } else {
      Alert.alert(
        "Warning",
        "This game already exists on your device. Do you want to overwrite it?",
        [
          {
            text: "Yes",
            style: "destructive",
            onPress: () => {
              downloadGame(game);
            },
          },
          { text: "No", style: "cancel" },
        ],
        {
          cancelable: true,
        }
      );
    }
  }

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      <View style={{ width: "100%", alignItems: "flex-end" }}>
        <MyButton
          width={200}
          text="Download Games"
          onPress={() => {
            seeOnlineGames();
          }}
        />
      </View>
      <FlatList
        width="100%"
        data={games}
        renderItem={({ item, index }) => (
          <GameItem
            onPress={() => {
              navigation.navigate("Game Home", {
                game: item,
                isAdmin: isAdmin,
              });
            }}
            onDelete={() => {
              deleteItemHandler(item);
            }}
            content={item}
            index={index}
            swipeableRow={swipeableRow}
            setSwipeableRow={setSwipeableRow}
            prevOpenedRow={prevOpenedRow}
            setPrevOpenedRow={setPrevOpenedRow}
          />
        )}
      />
      <Modal
        isVisible={isModalVisible}
        onBackButtonPress={toggleModal}
        onBackdropPress={toggleModal}
      >
        <View
          style={{
            alignItems: "center",
            justifyContent: "center",
            alignContent: "center",
            backgroundColor: "#fff",
          }}
        >
          <View
            style={{
              justifyContent: "flex-start",
              width: "100%",
              padding: 10,
            }}
          >
            <Text style={{ fontSize: 15, fontWeight: "600" }}>
              Choose a game to download:
            </Text>
          </View>
          <FlatList
            width="100%"
            data={onlineGames}
            renderItem={({ item, index }) => (
              <OnlineGameItem
                onPress={() => {
                  checkDownloadGame(item);
                  // navigation.navigate("Game Home", { game: item });
                }}
                onDelete={() => {
                  deleteItemHandler(item);
                }}
                content={item}
                index={index}
              />
            )}
          />
        </View>
        {isVisible && (
          <View
            style={{
              position: "absolute",
              backgroundColor: "#fff",
              opacity: 0.5,
              backfaceVisibility: "visible",
              width: "100%",
              height: "100%",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 100,
            }}
          >
            <LottieView
              source={require("../assets/loading.json")}
              style={styles.lottie}
              autoPlay
            />
            <Text>Downloading Game...</Text>
          </View>
        )}
      </Modal>
      {/* {isVisible && (
        <View
          style={{
            position: "absolute",
            backgroundColor: "#fff",
            opacity: 0.5,
            backfaceVisibility: "visible",
            width: "100%",
            height: "100%",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 100,
          }}
        >
          <LottieView
            source={require("../assets/loading.json")}
            style={styles.lottie}
            autoPlay
          />
          <Text>Downloading Game...</Text>
        </View>
      )} */}
    </View>
  );
};

export default ViewGames;

const styles = StyleSheet.create({
  lottie: {
    width: 100,
    height: 100,
  },
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "flex-start",
  },
  image: {
    width: 200,
    height: 200,
    margin: 20,
    marginBottom: 80,
  },
});
