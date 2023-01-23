import { StatusBar } from "expo-status-bar";
import {
  Button,
  StyleSheet,
  Text,
  View,
  Image,
  AppRegistry,
  processColor,
} from "react-native";
import MyButton from "../components/MyButton";
import React, { useEffect, useState, useRef } from "react";
import { ScrollView } from "react-native-gesture-handler";
import {
  ProgressChart,
  StackedBarChart,
  PieChart,
} from "react-native-chart-kit";
import { Dimensions } from "react-native";

import * as SQLite from "expo-sqlite";

const pieColors = [
  "#e6194b",
  "#3cb44b",
  "#ffe119",
  "#4363d8",
  "#f58231",
  "#911eb4",

  "#46f0f0",
  "#f032e6",

  "#bcf60c",
  "#fabebe",
  "#008080",
  "#e6beff",
  "#9a6324",
  "#fffac8",
  "#800000",
  "#aaffc3",
  "#808000",
  "#ffd8b1",
  "#000075",
  "#808080",
  "#ffffff",
  "#000000",
];

const db = SQLite.openDatabase("games.db");
const screenWidth = Dimensions.get("window").width;

const TeamStats = ({ navigation }) => {
  const [offensePoints, setOffensePoints] = useState(0);
  const [defensePoints, setDefensePoints] = useState(0);
  const [offenseScore, setOffenseScore] = useState(0);
  const [defenseScore, setDefenseScore] = useState(0);
  const [passesScore, setPassesScore] = useState([]);
  const [passesLoss, setPassesLoss] = useState([]);

  async function getData() {
    let actions = await new Promise((resolve, reject) => {
      db.transaction((tx) => {
        tx.executeSql(
          `select * from actionPerformed where action = "Score" OR action = "Callahan" OR action = "They Score" OR action = "Drop" OR action = "Throwaway" OR action="Catch" or action="Deep";`,
          [],
          (_, { rows: { _array } }) => {
            resolve(_array);
          },
          (_, error) => {
            reject(error);
          }
        );
      });
    });

    let games = await new Promise((resolve, reject) => {
      db.transaction((tx) => {
        tx.executeSql(
          `select * from game;`,
          [],
          (_, { rows: { _array } }) => {
            resolve(_array);
          },
          (_, error) => {
            reject(error);
          }
        );
      });
    });

    let gameTimestamps = games.map((game) => {
      return game.timestamp;
    });

    let allGames = [];

    for (let i = 0; i < gameTimestamps.length; i++) {
      let gameTimestamp = gameTimestamps[i];
      let gameActions = actions.filter((action) => {
        return action.gameTimestamp === gameTimestamp;
      });
      allGames.push({
        actions: gameActions,
        timestamp: gameTimestamp,
        startOffense: games[i]["startOffence"],
      });
    }

    let allOffensePoints = 0;
    let allDefensePoints = 0;
    let allOffenseScore = 0;
    let allDefenseScore = 0;
    let noPassesScore = {};
    let noPassesLoss = {};

    for (let i = 0; i < allGames.length; i++) {
      let game = allGames[i];
      // console.log("game", game);
      let actions = game.actions;
      let startOffense = game.startOffense === 1 ? true : false;
      let currPointOffence = startOffense;
      let myScore = 0;
      let theirScore = 0;
      let offensePoints = 0;
      let defensePoints = 0;
      let offenseScore = 0;
      let defenseScore = 0;

      let point = 0;
      let passes = 0;

      for (let j = 0; j < actions.length; j++) {
        let action = actions[j];

        if (action.action === "Score" || action.action === "Callahan") {
          if (currPointOffence) {
            offensePoints++;
            offenseScore++;
          } else {
            defensePoints++;
            defenseScore++;
          }
          myScore++;
          if (myScore === 7) {
            currPointOffence = !startOffense;
          } else {
            currPointOffence = false;
          }
          if (action.action === "Score") {
            passes += 1;
          }
          if (passes in noPassesScore) {
            noPassesScore[passes] += 1;
          } else {
            noPassesScore[passes] = 1;
          }
          passes = 0;
        } else if (action.action === "They Score") {
          if (currPointOffence) {
            offensePoints++;
          } else {
            defensePoints++;
          }
          theirScore++;
          if (theirScore === 7) {
            currPointOffence = !startOffense;
          } else {
            currPointOffence = true;
          }
          if (passes in noPassesLoss) {
            noPassesLoss[passes] += 1;
          } else {
            noPassesLoss[passes] = 1;
          }
          passes = 0;
        } else if (action.action === "Drop") {
        } else if (action.action === "Throwaway") {
        } else if (action.action === "Catch" || action.action === "Deep") {
          passes += 1;
        }
      }
      allOffensePoints += offensePoints;
      allDefensePoints += defensePoints;
      allOffenseScore += offenseScore;
      allDefenseScore += defenseScore;
    }

    setOffensePoints(allOffensePoints);
    setDefensePoints(allDefensePoints);
    setOffenseScore(allOffenseScore);
    setDefenseScore(allDefenseScore);

    let pie1 = [];
    let pie2 = [];
    let count = 0;
    // for (let key in noPassesScore) {
    //   pie1.push({
    //     name: key,
    //     value: noPassesScore[key],
    //     color: pieColors[count % 22],
    //     legendFontColor: "#7F7F7F",
    //     legendFontSize: 15,
    //   });
    //   count++;
    // }

    // let newPie1 = [];
    // // count = 0;

    // console.log("pie1", pie1);
    // group every range of 5 passes
    let start = 0;
    let interval = 5;
    let passesInInterval = {};
    for (let key in noPassesScore) {
      if (parseInt(key) >= start && parseInt(key) < start + interval) {
        if (start in passesInInterval) {
          passesInInterval[start] += noPassesScore[key];
        } else {
          passesInInterval[start] = noPassesScore[key];
        }
      } else {
        let flag = true;
        while (flag) {
          start += interval;

          if (parseInt(key) >= start && parseInt(key) < start + interval) {
            passesInInterval[start] = noPassesScore[key];
            flag = false;
          }
        }
      }
    }

    for (let key in passesInInterval) {
      pie1.push({
        name: key + " - " + (parseInt(key) + interval - 1),
        value: passesInInterval[key],
        color: pieColors[count % 22],
        legendFontColor: "#7F7F7F",
        legendFontSize: 15,
      });
      count++;
    }

    count = 0;
    // for (let key in noPassesLoss) {
    //   pie2.push({
    //     name: key,
    //     value: noPassesLoss[key],
    //     color: pieColors[count % 22],
    //     legendFontColor: "#7F7F7F",
    //     legendFontSize: 15,
    //   });
    //   count++;
    // }

    passesInInterval = {};
    start = 0;
    for (let key in noPassesLoss) {
      if (parseInt(key) >= start && parseInt(key) < start + interval) {
        if (start in passesInInterval) {
          passesInInterval[start] += noPassesLoss[key];
        } else {
          passesInInterval[start] = noPassesLoss[key];
        }
      } else {
        let flag = true;
        while (flag) {
          start += interval;

          if (parseInt(key) >= start && parseInt(key) < start + interval) {
            passesInInterval[start] = noPassesLoss[key];
            flag = false;
          }
        }
      }
    }

    for (let key in passesInInterval) {
      pie2.push({
        name: key + " - " + (parseInt(key) + interval - 1),
        value: passesInInterval[key],
        color: pieColors[count % 22],
        legendFontColor: "#7F7F7F",
        legendFontSize: 15,
      });
      count++;
    }

    setPassesScore(pie1);
    setPassesLoss(pie2);

    // console.log("Score", noPassesScore);
    // console.log("Loss", noPassesLoss);
  }
  useEffect(() => {
    // get actionPerformed table
    getData();
  }, []);

  const progressData = {
    labels: ["Offense", "Defense"], // optional
    data:
      offensePoints && defensePoints
        ? [offenseScore / offensePoints, defenseScore / defensePoints]
        : [0, 0],
    colors: ["#e6194b", "#3cb44b", "#4363d8"],
  };

  return (
    <View
      style={{
        flexDirection: "column",
        width: "100%",
        height: "100%",
        backgroundColor: "#fff",
      }}
    >
      <ScrollView>
        <View
          style={{
            flex: 1,
            width: "100%",
            borderTopWidth: 0.5,
            paddingBottom: 15,
          }}
        >
          <Text style={{ margin: 10, fontSize: 18, fontWeight: "600" }}>
            Offense and defense efficiency:{" "}
          </Text>
          <ProgressChart
            data={progressData}
            width={screenWidth}
            height={150}
            chartConfig={styles.chartConfig}
            withCustomBarColorFromData={true}
          />
          <View
            style={{
              borderBottomWidth: 0.5,
              paddingBottom: 5,
              paddingLeft: 10,
            }}
          >
            <Text>
              You played on offense{" "}
              <Text>
                {offensePoints} times and scored {offenseScore} of them.
              </Text>
            </Text>
            <Text>
              You played on defense{" "}
              <Text>
                {defensePoints} times and scored {defenseScore} of them.
              </Text>
            </Text>
          </View>
          <Text style={{ margin: 10, fontSize: 18, fontWeight: "600" }}>
            Number of passes when we scored:{" "}
          </Text>
          <PieChart
            data={passesScore || []}
            width={screenWidth}
            height={150}
            chartConfig={styles.chartConfig}
            accessor="value"
          />
          <View style={{ borderBottomWidth: 0.5, paddingBottom: 5 }} />
          <Text style={{ margin: 10, fontSize: 18, fontWeight: "600" }}>
            Number of passes when we lost the point:{" "}
          </Text>

          <PieChart
            data={passesLoss || []}
            width={screenWidth}
            height={150}
            chartConfig={styles.chartConfig}
            accessor="value"
          />
        </View>
        <View style={{ alignSelf: "center" }}>
          <MyButton
            text={"Line Builder"}
            onPress={() => navigation.navigate("Line Builder")}
          />
        </View>
      </ScrollView>
    </View>
  );
};

export default TeamStats;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  image: {
    width: 200,
    height: 200,
    margin: 20,
    marginBottom: 80,
  },
  chartConfig: {
    backgroundGradientFrom: "#fff",
    backgroundGradientFromOpacity: 0.5,
    backgroundGradientTo: "#fff",
    backgroundGradientToOpacity: 1,
    // color: (opacity = 1) => `rgba(26, 255, 146, ${opacity})`,
    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
  },
});
