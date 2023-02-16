import { StatusBar } from "expo-status-bar";
import { Button, StyleSheet, Text, View, Image } from "react-native";
import MyButton from "../components/MyButton";
import React, { useEffect } from "react";

import * as SQLite from "expo-sqlite";
import { FlatList, ScrollView } from "react-native-gesture-handler";

let playerImages = {
  Mohey: require("../assets/players/Mohey.png"),
  Mini: require("../assets/players/Mini.png"),
  Mariam: require("../assets/players/Mariam.png"),
  Lord: require("../assets/players/Lord.png"),
  Jala: require("../assets/players/Jala.png"),
  Badr: require("../assets/players/Badr.png"),
  Asfar: require("../assets/players/Asfar.png"),
  Shoaib: require("../assets/players/Shoaib.png"),
  Any: require("../assets/players/Any.png"),
};

const db = SQLite.openDatabase("games.db");

const OverallStats = ({ navigation }) => {
  const color = "#513e85";
  const [chosenStat, setChosenStat] = React.useState("+/-Count");
  const [plusminus, setPlusminus] = React.useState([]);
  const [pointsPlayed, setPointsPlayed] = React.useState([]);
  const [goals, setGoals] = React.useState([]);
  const [assists, setAssists] = React.useState([]);
  const [callahans, setCallahans] = React.useState([]);
  const [throws, setThrows] = React.useState([]);
  const [catches, setCatches] = React.useState([]);
  const [drops, setDrops] = React.useState([]);
  const [throwaways, setThrowaways] = React.useState([]);
  const [ds, setDs] = React.useState([]);
  const [deeps, setDeeps] = React.useState([]);
  const [catchedDeeps, setCatchedDeeps] = React.useState([]);
  const [preAssists, setPreAssists] = React.useState([]);

  function getData() {
    if (chosenStat === "Points Played") {
      return pointsPlayed;
    } else if (chosenStat === "Goals") {
      return goals;
    } else if (chosenStat === "Assists") {
      return assists;
    } else if (chosenStat === "Callahans") {
      return callahans;
    } else if (chosenStat === "Throws") {
      return throws;
    } else if (chosenStat === "Catches") {
      return catches;
    } else if (chosenStat === "Drops") {
      return drops;
    } else if (chosenStat === "Throwaways") {
      return throwaways;
    } else if (chosenStat === "Ds") {
      return ds;
    } else if (chosenStat === "Deeps") {
      return deeps;
    } else if (chosenStat === "Deep Catches") {
      return catchedDeeps;
    } else if (chosenStat === "Pre-Assists") {
      return preAssists;
    } else if (chosenStat === "+/-Count") {
      return plusminus;
    }
  }

  async function onScreenLoad() {
    let localPlayers = await new Promise((resolve, reject) => {
      db.transaction((tx) => {
        tx.executeSql(
          "select DISTINCT playerName from actionPerformed where playerName IS NOT NULL AND playerName != 'UNKNOWN';",
          [],
          (_, { rows: { _array } }) => {
            resolve(_array);
            console.log("localPlayers", _array);
          },
          (_, error) => {
            reject(error);
          }
        );
      });
    });
    // console.log("localPlayers", localPlayers);

    // add players on mysql to local storage
    let playerNames = localPlayers.map((player) => {
      return player.playerName;
    });

    db.transaction((tx) => {
      //Points Played
      tx.executeSql(
        `SELECT playerName, COUNT(*) FROM actionPerformed WHERE action="In Point" GROUP BY playerName ORDER BY COUNT(*) DESC`,
        [],
        (txObj, { rows: { _array } }) => {
          //   console.log(_array);
          let pointsPlayed = _array.map((item) => {
            let x = {
              playerName: item.playerName,
              stat: item["COUNT(*)"],
            };
            // console.log(x.stat);
            return x;
          });
          // console.log(_array);

          // for (let i = 0; i < _array.length; i++) {
          //   console.log("array", _array[i]);
          // }

          // console.log("pointsPlayed", pointsPlayed);
          // add the rest of the players to the array with 0 points played
          playerNames.forEach((player) => {
            let found = false;
            pointsPlayed.forEach((item) => {
              if (item.playerName === player) {
                found = true;
              }
            });
            if (!found) {
              pointsPlayed.push({ playerName: player, stat: 0 });
            }
          });

          setPointsPlayed(pointsPlayed);
        },
        (txObj, error) => console.log("Error", error)
      );
    });
    db.transaction((tx) => {
      //Goals
      tx.executeSql(
        `SELECT playerName, COUNT(*) FROM actionPerformed WHERE action="Score" OR action="Callahan" GROUP BY playerName ORDER BY COUNT(*) DESC`,
        [],
        (txObj, { rows: { _array } }) => {
          //   console.log(_array);
          let goals = _array.map((item) => {
            let x = {
              playerName: item.playerName,
              stat: item["COUNT(*)"],
            };
            // console.log(x.stat);
            return x;
          });

          playerNames.forEach((player) => {
            let found = false;
            goals.forEach((item) => {
              if (item.playerName === player) {
                found = true;
              }
            });
            if (!found) {
              goals.push({ playerName: player, stat: 0 });
            }
          });

          setGoals(goals);
        },
        (txObj, error) => console.log("Error", error)
      );
    });
    db.transaction((tx) => {
      //Assists
      tx.executeSql(
        `SELECT associatedPlayer, COUNT(*) FROM actionPerformed WHERE action="Score" GROUP BY associatedPlayer ORDER BY COUNT(*) DESC`,
        [],
        (txObj, { rows: { _array } }) => {
          //   console.log(_array);
          let assists = _array.map((item) => {
            let x = {
              playerName: item.associatedPlayer,
              stat: item["COUNT(*)"],
            };
            // console.log(x.stat);
            return x;
          });

          playerNames.forEach((player) => {
            let found = false;
            assists.forEach((item) => {
              if (item.playerName === player) {
                found = true;
              }
            });
            if (!found) {
              assists.push({ playerName: player, stat: 0 });
            }
          });

          setAssists(assists);
        },
        (txObj, error) => console.log("Error", error)
      );
    });
    db.transaction((tx) => {
      //Callahans
      tx.executeSql(
        `SELECT playerName, COUNT(*) FROM actionPerformed WHERE action="Callahan" GROUP BY playerName ORDER BY COUNT(*) DESC`,
        [],
        (txObj, { rows: { _array } }) => {
          //   console.log(_array);
          let callahans = _array.map((item) => {
            let x = {
              playerName: item.playerName,
              stat: item["COUNT(*)"],
            };
            // console.log(x.stat);
            return x;
          });

          playerNames.forEach((player) => {
            let found = false;
            callahans.forEach((item) => {
              if (item.playerName === player) {
                found = true;
              }
            });
            if (!found) {
              callahans.push({ playerName: player, stat: 0 });
            }
          });

          setCallahans(callahans);
        },
        (txObj, error) => console.log("Error", error)
      );
    });
    db.transaction((tx) => {
      //Throws
      tx.executeSql(
        `SELECT associatedPlayer, COUNT(*) FROM actionPerformed WHERE action="Catch" OR action="Score" OR action="Deep" GROUP BY associatedPlayer ORDER BY COUNT(*) DESC`,
        [],
        (txObj, { rows: { _array } }) => {
          //   console.log(_array);
          let throws = _array.map((item) => {
            let x = {
              playerName: item.associatedPlayer,
              stat: item["COUNT(*)"],
            };
            // console.log(x.stat);
            return x;
          });

          playerNames.forEach((player) => {
            let found = false;
            throws.forEach((item) => {
              if (item.playerName === player) {
                found = true;
              }
            });
            if (!found) {
              throws.push({ playerName: player, stat: 0 });
            }
          });

          setThrows(throws);
        },
        (txObj, error) => console.log("Error", error)
      );
    });
    db.transaction((tx) => {
      //Catches
      tx.executeSql(
        `SELECT playerName, COUNT(*) FROM actionPerformed WHERE action="Catch" OR action="Deep" OR action="Score" GROUP BY playerName ORDER BY COUNT(*) DESC`,
        [],
        (txObj, { rows: { _array } }) => {
          //   console.log(_array);
          let catches = _array.map((item) => {
            let x = {
              playerName: item.playerName,
              stat: item["COUNT(*)"],
            };
            // console.log(x.stat);
            return x;
          });

          playerNames.forEach((player) => {
            let found = false;
            catches.forEach((item) => {
              if (item.playerName === player) {
                found = true;
              }
            });
            if (!found) {
              catches.push({ playerName: player, stat: 0 });
            }
          });

          setCatches(catches);
        },
        (txObj, error) => console.log("Error", error)
      );
    });
    db.transaction((tx) => {
      //Drops
      tx.executeSql(
        `SELECT playerName, COUNT(*) FROM actionPerformed WHERE action="Drop" GROUP BY playerName ORDER BY COUNT(*) DESC`,
        [],
        (txObj, { rows: { _array } }) => {
          //   console.log(_array);
          let drops = _array.map((item) => {
            let x = {
              playerName: item.playerName,
              stat: item["COUNT(*)"],
            };
            // console.log(x.stat);
            return x;
          });

          playerNames.forEach((player) => {
            let found = false;
            drops.forEach((item) => {
              if (item.playerName === player) {
                found = true;
              }
            });
            if (!found) {
              drops.push({ playerName: player, stat: 0 });
            }
          });

          setDrops(drops);
        },
        (txObj, error) => console.log("Error", error)
      );
    });
    db.transaction((tx) => {
      //Throwaways
      tx.executeSql(
        `SELECT playerName, COUNT(*) FROM actionPerformed WHERE action="Throwaway" GROUP BY playerName ORDER BY COUNT(*) DESC`,
        [],
        (txObj, { rows: { _array } }) => {
          //   console.log(_array);
          let throwaways = _array.map((item) => {
            let x = {
              playerName: item.playerName,
              stat: item["COUNT(*)"],
            };
            // console.log(x.stat);
            return x;
          });

          playerNames.forEach((player) => {
            let found = false;
            throwaways.forEach((item) => {
              if (item.playerName === player) {
                found = true;
              }
            });
            if (!found) {
              throwaways.push({ playerName: player, stat: 0 });
            }
          });

          setThrowaways(throwaways);
        },
        (txObj, error) => console.log("Error", error)
      );
    });
    db.transaction((tx) => {
      //Ds
      tx.executeSql(
        `SELECT playerName, COUNT(*) FROM actionPerformed WHERE action="Defence" GROUP BY playerName ORDER BY COUNT(*) DESC`,
        [],
        (txObj, { rows: { _array } }) => {
          //   console.log(_array);
          let ds = _array.map((item) => {
            let x = {
              playerName: item.playerName,
              stat: item["COUNT(*)"],
            };
            // console.log(x.stat);
            return x;
          });

          playerNames.forEach((player) => {
            let found = false;
            ds.forEach((item) => {
              if (item.playerName === player) {
                found = true;
              }
            });
            if (!found) {
              ds.push({ playerName: player, stat: 0 });
            }
          });

          setDs(ds);
        },
        (txObj, error) => console.log("Error", error)
      );
    });
    db.transaction((tx) => {
      //Catched Deeps
      tx.executeSql(
        `SELECT playerName, COUNT(*) FROM actionPerformed WHERE action="Deep" GROUP BY playerName ORDER BY COUNT(*) DESC`,
        [],
        (txObj, { rows: { _array } }) => {
          //   console.log(_array);
          let deeps = _array.map((item) => {
            let x = {
              playerName: item.playerName,
              stat: item["COUNT(*)"],
            };
            // console.log(x.stat);
            return x;
          });

          playerNames.forEach((player) => {
            let found = false;
            deeps.forEach((item) => {
              if (item.playerName === player) {
                found = true;
              }
            });
            if (!found) {
              deeps.push({ playerName: player, stat: 0 });
            }
          });

          setCatchedDeeps(deeps);
        },
        (txObj, error) => console.log("Error", error)
      );
    });
    db.transaction((tx) => {
      //Deeps
      tx.executeSql(
        `SELECT associatedPlayer, COUNT(*) FROM actionPerformed WHERE action="Deep" GROUP BY associatedPlayer ORDER BY COUNT(*) DESC`,
        [],
        (txObj, { rows: { _array } }) => {
          //   console.log(_array);
          let catchedDeeps = _array.map((item) => {
            let x = {
              playerName: item.associatedPlayer,

              stat: item["COUNT(*)"],
            };
            // console.log(x.stat);
            return x;
          });

          playerNames.forEach((player) => {
            let found = false;
            catchedDeeps.forEach((item) => {
              if (item.playerName === player) {
                found = true;
              }
            });
            if (!found) {
              catchedDeeps.push({ playerName: player, stat: 0 });
            }
          });

          setDeeps(catchedDeeps);
        },
        (txObj, error) => console.log("Error", error)
      );
    });

    db.transaction((tx) => {
      tx.executeSql(
        "select * from actionPerformed;",
        [],
        (_, { rows: { _array } }) => {
          //   console.log(_array);
          let allGamesActions = [];
          let prevGame = null;
          let actions = [];
          let actionsPerformed = _array;

          for (let i = 0; i < actionsPerformed.length; i++) {
            let action = actionsPerformed[i];
            if (prevGame === null) {
              prevGame = action.gameTimestamp;
            } else {
              if (prevGame !== action.gameTimestamp) {
                allGamesActions.push(actions);
                actions = [];
                prevGame = action.gameTimestamp;
              }
            }
            if (action.action === "Score") {
              actions.push({
                action: "Score",
                player: action.playerName,
                point: action.point,
                associatedPlayer: action.associatedPlayer,
              });
            } else if (action.action === "They Score") {
              actions.push({
                action: "They Score",
                player: null,
                point: action.point,
                associatedPlayer: null,
              });
            } else if (action.action === "Their Throwaway") {
              actions.push({
                action: "Their Throwaway",
                player: null,
                point: action.point,
                associatedPlayer: null,
              });
            } else if (action.action === "Catch") {
              actions.push({
                action: "Catch",
                player: action.playerName,
                point: action.point,
                associatedPlayer: action.associatedPlayer,
              });
            } else if (action.action === "Throwaway") {
              actions.push({
                action: "Throwaway",
                player: action.playerName,
                point: action.point,
                associatedPlayer: null,
              });
            } else if (action.action === "Defence") {
              actions.push({
                action: "Defence",
                player: action.playerName,
                point: action.point,
                associatedPlayer: null,
              });
            } else if (action.action === "Deep") {
              actions.push({
                action: "Deep",
                player: action.playerName,
                point: action.point,
                associatedPlayer: action.associatedPlayer,
              });
            } else if (action.action === "Drop") {
              actions.push({
                action: "Drop",
                player: action.playerName,
                point: action.point,
                associatedPlayer: action.associatedPlayer,
              });
            } else if (action.action === "Stalled") {
              actions.push({
                action: "Stalled",
                player: action.playerName,
                point: action.point,
                associatedPlayer: null,
              });
            } else if (action.action === "Subbed In") {
              actions.push({
                action: "Subbed In",
                player: action.playerName,
                point: action.point,
                associatedPlayer: action.associatedPlayer,
              });
            } else if (action.action === "Callahan") {
              actions.push({
                action: "Callahan",
                player: action.playerName,
                point: action.point,
                associatedPlayer: null,
              });
            } else if (action.action === "Callahan'd") {
              actions.push({
                action: "Callahan'd",
                player: action.playerName,
                point: action.point,
                associatedPlayer: null,
              });
            }
          }

          if (actions.length > 0) {
            allGamesActions.push(actions);
          }

          let pm = {};
          let preAssists = {};

          for (let i = 0; i < playerNames.length; i++) {
            pm[playerNames[i]] = { stat: 0 };
            preAssists[playerNames[i]] = { stat: 0 };
          }

          for (let j = 0; j < allGamesActions.length; j++) {
            for (let i = 0; i < allGamesActions[j].length; i++) {
              let action = allGamesActions[j][i];
              if (
                action.action === "Score" ||
                action.action === "Defence" ||
                action.action === "Callahan"
              ) {
                // console.log(action.player);
                if (action.player === null) {
                  continue;
                }

                pm[action.player]["stat"] += 1;
                if (action.action === "Callahan") {
                  pm[action.player]["stat"] += 1;
                }
              } else if (
                action.action === "Throwaway" ||
                action.action === "Drop" ||
                action.action === "Stalled"
              ) {
                if (action.player === null) {
                  continue;
                }
                pm[action.player].stat -= 1;
              }
              if (action.action === "Score" || action.action === "Deep") {
                if (action.player === null) {
                  continue;
                }
                pm[action.associatedPlayer].stat += 1;
              }
              if (i < allGamesActions[j].length - 1) {
                let nextAction = allGamesActions[j][i + 1];

                if (
                  (action.action === "Catch" || action.action === "Deep") &&
                  nextAction.action === "Score" &&
                  action.associatedPlayer !== nextAction.player
                ) {
                  preAssists[action.associatedPlayer].stat += 1;
                }
              }
            }
          }

          // console.log(pm);

          let pmArray = [];
          for (let key in pm) {
            pmArray.push({ playerName: key, stat: pm[key].stat });
          }

          pmArray.sort((a, b) => {
            return b.stat - a.stat;
          });

          setPlusminus(pmArray);

          let preAssistsArray = [];
          for (let key in preAssists) {
            preAssistsArray.push({
              playerName: key,
              stat: preAssists[key].stat,
            });
          }

          preAssistsArray.sort((a, b) => {
            return b.stat - a.stat;
          });

          setPreAssists(preAssistsArray);
        }
      );
    });
  }

  useEffect(() => {
    onScreenLoad();
  }, []);

  return (
    <View style={styles.container}>
      <View style={{ flexDirection: "row", width: "100%" }}>
        <View style={{}}>
          <ScrollView style={{ borderRightWidth: 0.5 }}>
            <MyButton
              color={"+/-Count" === chosenStat ? "#808080" : color}
              width={100}
              height={50}
              text={"+/-Count"}
              onPress={() => {
                setChosenStat("+/-Count");
              }}
            />
            <MyButton
              color={"Points Played" === chosenStat ? "#808080" : color}
              width={100}
              height={50}
              text={"Points Played"}
              onPress={() => {
                setChosenStat("Points Played");
              }}
            />
            <MyButton
              color={"Goals" === chosenStat ? "#808080" : color}
              width={100}
              height={50}
              text={"Goals"}
              onPress={() => {
                setChosenStat("Goals");
              }}
            />
            <MyButton
              color={"Assists" === chosenStat ? "#808080" : color}
              width={100}
              height={50}
              text={"Assists"}
              onPress={() => {
                setChosenStat("Assists");
              }}
            />
            <MyButton
              color={"Callahans" === chosenStat ? "#808080" : color}
              width={100}
              height={50}
              text={"Callahans"}
              onPress={() => {
                setChosenStat("Callahans");
              }}
            />
            <MyButton
              color={"Throws" === chosenStat ? "#808080" : color}
              width={100}
              height={50}
              text={"Throws"}
              onPress={() => {
                setChosenStat("Throws");
              }}
            />
            <MyButton
              color={"Catches" === chosenStat ? "#808080" : color}
              width={100}
              height={50}
              text={"Catches"}
              onPress={() => {
                setChosenStat("Catches");
              }}
            />
            <MyButton
              color={"Drops" === chosenStat ? "#808080" : color}
              width={100}
              height={50}
              text={"Drops"}
              onPress={() => {
                setChosenStat("Drops");
              }}
            />
            <MyButton
              color={"Throwaways" === chosenStat ? "#808080" : color}
              width={100}
              height={50}
              text={"Throwaways"}
              onPress={() => {
                setChosenStat("Throwaways");
              }}
            />
            <MyButton
              color={"Ds" === chosenStat ? "#808080" : color}
              width={100}
              height={50}
              text={"Ds"}
              onPress={() => {
                setChosenStat("Ds");
              }}
            />
            <MyButton
              color={"Deeps" === chosenStat ? "#808080" : color}
              width={100}
              height={50}
              text={"Deeps"}
              onPress={() => {
                setChosenStat("Deeps");
              }}
            />
            <MyButton
              color={"Deep Catches" === chosenStat ? "#808080" : color}
              width={100}
              height={50}
              text={"Deep Catches"}
              onPress={() => {
                setChosenStat("Deep Catches");
              }}
            />
            <MyButton
              color={"Pre-Assists" === chosenStat ? "#808080" : color}
              width={100}
              height={50}
              text={"Pre-Assists"}
              onPress={() => {
                setChosenStat("Pre-Assists");
              }}
            />
          </ScrollView>
        </View>
        <FlatList
          style={{ flex: 1 }}
          data={getData()}
          renderItem={({ item, index }) => {
            let name;
            if (item.playerName === null) {
              name = "UNKNOWN";
            } else {
              name = item.playerName;
            }
            return (
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignContent: "center",
                  alignItems: "center",
                  margin: 5,
                  borderBottomWidth: 0.5,
                }}
              >
                <Image
                  source={
                    name in playerImages
                      ? playerImages[name]
                      : playerImages["Any"]
                  }
                  style={styles.image}
                />
                <Text style={{ fontSize: 16 }}>{name}</Text>
                <Text style={{ fontSize: 16 }}>{item.stat}</Text>
              </View>
            );
          }}
        ></FlatList>
      </View>

      <StatusBar style="auto" />
    </View>
  );
};

export default OverallStats;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  image: {
    width: 50,
    height: 65,
    margin: 0,
    marginBottom: 0,
  },
});
