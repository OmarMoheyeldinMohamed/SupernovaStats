import React, { useRef, useState, useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import {
  Button,
  StyleSheet,
  Text,
  View,
  Image,
  TextInput,
  Alert,
} from "react-native";
import MyButton from "../components/MyButton";
import { SelectList } from "react-native-dropdown-select-list";
import { Component } from "react";
import SegmentedPicker from "react-native-segmented-picker";
import Pressable from "react-native/Libraries/Components/Pressable/Pressable";
import Modal from "react-native-modal";
import axios from "axios";
import CheckBox from "expo-checkbox";
import * as SQLite from "expo-sqlite";
// import AnimatedLoader from "react-native-animated-loader";
import LottieView from "lottie-react-native";

// const ip = "http://192.168.76.177:3000";
const ip = "https://supernovabackend.onrender.com";

async function getCompetitions() {
  // use mysql to get all competitions
  return await axios({
    method: "get",
    url: ip + "/competition",
  }).then(function (response) {
    return response.data;
  });
}

async function getOpponents() {
  // use mysql to get all opponents
  return await axios({
    method: "get",
    url: ip + "/opponent",
  }).then(function (response) {
    return response.data;
  });
}

function competitionInfoToNames(competitionsInfo) {
  var competitionNames = [];
  for (let i = 0; i < competitionsInfo.length; i++) {
    competitionNames.push(competitionsInfo[i].name);
  }
  return competitionNames;
}

function opponentInfoToNames(opponentsInfo) {
  var opponentNames = [];
  for (let i = 0; i < opponentsInfo.length; i++) {
    opponentNames.push(opponentsInfo[i].name);
  }
  return opponentNames;
}

async function addCompetitiontoDB(name) {
  return await axios({
    method: "post",
    url: ip + "/competition",
    data: {
      name: name,
    },
  })
    .then(function (response) {
      return response.data;
    })
    .catch(function (error) {
      console.log(error);
    });
}

async function addOpponenttoDB(name) {
  return await axios({
    method: "post",
    url: ip + "/opponent",
    data: {
      name: name,
    },
  })
    .then(function (response) {
      return response.data;
    })
    .catch(function (error) {
      console.log(error);
    });
}

const AddGame = ({ navigation }) => {
  const db = SQLite.openDatabase("games.db");
  const [visible, setVisible] = useState(true);

  const [selectedCompetition, setSelectedCompetition] = React.useState([]);
  const [selectedOpponent, setSelectedOpponent] = React.useState([]);

  const [toggleCheckBox, setToggleCheckBox] = useState(false);

  const ref_competitionTextInput = useRef();

  const [isModalVisible, setModalVisible] = useState(false);

  const toggleModal = () => {
    setModalVisible(!isModalVisible);
    setEnteredName("");
  };

  const [isModalOpponentVisible, setModalOpponentVisible] = useState(false);

  const toggleModalOpponent = () => {
    setModalOpponentVisible(!isModalOpponentVisible);
    setEnteredName("");
  };

  const [competitionsData, setCompetitionsData] = React.useState([]);
  const [opponentData, setOpponentData] = React.useState([]);

  const onScreenLoad = async () => {
    try {
      var competitionsInfo = await getCompetitions();
      var competitionNames = competitionInfoToNames(competitionsInfo);
      setCompetitionsData(competitionNames);
      setVisible(false);
    } catch (err) {
      console.log(err);
    }
    try {
      var opponentsInfo = await getOpponents();
      var opponentNames = opponentInfoToNames(opponentsInfo);
      setOpponentData(opponentNames);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    onScreenLoad();
  }, []);

  // var segmentedPicker = React.createRef();

  // function onConfirm(selections) {
  //   console.info(selections);
  //   segmentedPicker.current.hide();
  //   // => { col_1: "option_1", col_2: "option_3" }
  // }

  const [enteredName, setEnteredName] = useState("");
  function nameInputHandler(enteredText) {
    setEnteredName(enteredText);
  }

  function addCompetitionHandler() {
    if (enteredName.length === 0) {
      Alert.alert(
        "Field Missing",
        "Please enter a competition name",
        [{ text: "Ok" }],
        {
          cancelable: true,
        }
      );
      return;
    } else if (competitionsData.includes(enteredName)) {
      Alert.alert(
        "Competition Already Exists",
        "Please enter a different competition name",
        [{ text: "Ok" }],
        {
          cancelable: true,
        }
      );
      return;
    }

    addCompetitiontoDB(enteredName);
    setEnteredName("");
    toggleModal();
    onScreenLoad();
  }

  function addOpponentHandler() {
    if (enteredName.length === 0) {
      Alert.alert(
        "Field Missing",
        "Please enter an opponent name",
        [{ text: "Ok" }],
        {
          cancelable: true,
        }
      );
      return;
    } else if (opponentData.includes(enteredName)) {
      Alert.alert(
        "Opponent Already Exists",
        "Please enter a different opponent name",
        [{ text: "Ok" }],
        {
          cancelable: true,
        }
      );
      return;
    }

    addOpponenttoDB(enteredName);
    setEnteredName("");
    toggleModalOpponent();
    onScreenLoad();
  }

  function changeCheckbox() {
    setToggleCheckBox(!toggleCheckBox);
  }

  async function addGameHandler() {
    if (selectedCompetition.length == 0) {
      Alert.alert(
        "Field Missing",
        "Please select a competition",
        [{ text: "Ok", onPress: () => console.log("") }],
        {
          cancelable: true,
        }
      );
      return;
    }
    if (selectedOpponent.length == 0) {
      Alert.alert(
        "Field Missing",
        "Please select an opponent",
        [{ text: "Ok", onPress: () => console.log("") }],
        {
          cancelable: true,
        }
      );
      return;
    }

    // console.log(selectedCompetition);
    // console.log(selectedOpponent);
    // console.log(toggleCheckBox);

    let isHome = toggleCheckBox ? 1 : 0;
    setVisible(true);
    await axios({
      method: "post",
      url: ip + "/game",
      data: {
        category: selectedCompetition,
        opponent: selectedOpponent,
        isHome: isHome,
      },
    })
      .then(function (response) {
        return response.data;
      })
      .catch(function (error) {
        console.log(error);
      });

    //get the timestamp of the game
    let timestamp = await axios({
      method: "get",
      url:
        ip +
        `/gameT?category=${selectedCompetition}&opponent=${selectedOpponent}`,
    })
      .then(function (response) {
        return response.data[0]["timestamp"];
      })
      .catch(function (error) {
        console.log(error);
      });

    //add the game to the local database
    let date = new Date(timestamp);
    let timeStr =
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

    db.transaction((tx) => {
      console.log(timeStr);
      tx.executeSql(
        `
        INSERT INTO game (opponent, home, category, timestamp) VALUES ('${selectedOpponent}', '${isHome}', '${selectedCompetition}', '${timeStr}');
        `,
        null,
        (tx, results) => {
          console.log("Query completed");
          console.log(results.rows);
        },
        (tx, error) => {
          console.log("Error: " + error);
        }
      );
    });
    setVisible(false);
    navigation.goBack();
    // navigation.navigate("Home");
  }

  return (
    <View style={styles.container}>
      <View style={styles.container2}>
        <View style={{ ...styles.container, ...{ flex: 3 } }}>
          <SelectList
            setSelected={(val) => setSelectedCompetition(val)}
            data={competitionsData}
            save="value"
            placeholder="Choose Competition"
            search={false}
            searchPlaceholder="Search"
            boxStyles={{
              width: "100%",
              height: 50,
              backgroundColor: "#fff",
              // borderColor: "#808080",
              borderWidth: 0,
              borderRadius: 5,
              marginBottom: 10,
              padding: 10,
              fontSize: 20,
              fontWeight: "bold",
              marginTop: 10,
            }}
          />
        </View>

        <View flex={2}>
          <MyButton
            onPress={toggleModal}
            flex={1}
            heightOnly={45}
            color={"#2bbf0a"}
            textColor={"#000000"}
            text="Add Competition"
          />
        </View>
        <Modal
          isVisible={isModalVisible}
          onBackButtonPress={toggleModal}
          onBackdropPress={toggleModal}
        >
          <View
            style={{
              backgroundColor: "#fff",
              justifyContent: "center",
              alignItems: "center",
              padding: 20,
              borderRadius: 10,
            }}
          >
            <TextInput
              onChangeText={nameInputHandler}
              style={styles.textInput}
              placeholder="Enter name"
              value={enteredName}
              returnKeyType="done"
              ref={ref_competitionTextInput}
            ></TextInput>
            <MyButton
              onPress={addCompetitionHandler}
              heightOnly={45}
              textColor={"#000000"}
              text="Add Competition"
            />
          </View>
        </Modal>
      </View>

      <View style={styles.container2}>
        <View style={{ ...styles.container, ...{ flex: 3 } }}>
          <SelectList
            setSelected={(val) => setSelectedOpponent(val)}
            data={opponentData}
            save="value"
            placeholder="Choose Opponent"
            search={false}
            searchPlaceholder="Search"
            boxStyles={{
              width: "100%",
              height: 50,
              backgroundColor: "#fff",
              // borderColor: "#808080",
              borderWidth: 0,
              borderRadius: 5,
              marginBottom: 10,
              padding: 10,
              fontSize: 20,
              fontWeight: "bold",
              marginTop: 10,
            }}
          />
        </View>

        <View flex={2}>
          <MyButton
            onPress={toggleModalOpponent}
            flex={1}
            heightOnly={45}
            color={"#2bbf0a"}
            textColor={"#000000"}
            text="Add Opponent"
          />
        </View>
        <Modal
          isVisible={isModalOpponentVisible}
          onBackButtonPress={toggleModalOpponent}
          onBackdropPress={toggleModalOpponent}
        >
          <View
            style={{
              backgroundColor: "#fff",
              justifyContent: "center",
              alignItems: "center",
              padding: 20,
              borderRadius: 10,
            }}
          >
            <TextInput
              onChangeText={nameInputHandler}
              style={styles.textInput}
              placeholder="Enter name"
              value={enteredName}
              returnKeyType="done"
            ></TextInput>
            <MyButton
              onPress={addOpponentHandler}
              heightOnly={45}
              textColor={"#000000"}
              text="Add Opponent"
            />
          </View>
        </Modal>
      </View>

      <Pressable onPress={changeCheckbox}>
        <View margin={10}>
          <View style={styles.container2}>
            <Text style={{ margin: 10 }}>Home Game</Text>
            <CheckBox
              disabled={false}
              value={toggleCheckBox}
              onValueChange={(newValue) => setToggleCheckBox(newValue)}
              style={{ margin: 10 }}
            />
          </View>
        </View>
      </Pressable>
      {/* center align MyButton */}
      <View
        style={{
          ...styles.container,
          ...{
            alignItems: "center",
            backgroundColor: "white",
            width: "100%",
            marginTop: 70,
            justifyContent: "flex-start",
          },
        }}
      >
        <MyButton
          onPress={addGameHandler}
          text="Add Game"
          alignItems="center"
          justifyContent="center"
        />
      </View>
      {visible && (
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
          }}
        >
          <LottieView
            source={require("../assets/loading.json")}
            style={styles.lottie}
            autoPlay
          />
          <Text>Loading...</Text>
        </View>
      )}
    </View>
  );
};

export default AddGame;

const styles = StyleSheet.create({
  lottie: {
    width: 100,
    height: 100,
  },
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "flex-start",
    justifyContent: "flex-start",
  },
  image: {
    width: 200,
    height: 200,
    margin: 20,
    marginBottom: 80,
  },
  textInput: {
    borderWidth: 1,
    borderColor: "#808080",
    backgroundColor: "#bfbfbd",
    color: "#120438",
    borderRadius: 8,
    flex: 0,
    padding: 10,
    margin: 3,
    width: "100%",
  },
  container2: {
    flex: 0,
    backgroundColor: "#fff",
    alignItems: "flex-start",
    justifyContent: "flex-start",
    width: "100%",
    flexDirection: "row",
  },
});

//<DropdownMenu
//     style={{ flex: 1 }}
//     bgColor={"white"}
//     tintColor={"#666666"}
//     activityTintColor={"green"}
//     handler={
//       (selection, row) => {}
//       //   this.setState({ text: data[selection][row] })
//     }
//     data={data}
//   >
//     {/* <View style={{ flex: 1 }}>
//       <Text>{this.state.text} is the best language in the world</Text>
//     </View> */}
//</DropdownMenu>

/* <Pressable
          onPress={() => {
            segmentedPicker.current.show();
          }}
        >
          <View flex={1}>
            <Text style={{ fontSize: 20, fontWeight: "bold" }}>Add Game</Text>
            <SegmentedPicker
              borderColor={"#808080"}
              borderWidth={1}
              ref={segmentedPicker}
              onConfirm={onConfirm}
              options={[
                {
                  key: "col_1",
                  items: [
                    { label: "Option 1", value: "option_1" },
                    { label: "Option 2", value: "option_2" },
                  ],
                },
                {
                  key: "col_2",
                  items: [{ label: "Option 3", value: "option_3" }],
                },
              ]}
            />
          </View>
        </Pressable> */
