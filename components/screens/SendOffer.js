import React, {useEffect, useState} from "react";
import {ActivityIndicator, Image, StyleSheet, Text, TouchableOpacity, View,} from "react-native";
import Wrapper from "../helpers/Wrapper";
import {ImageCallGreen, ImageEmailGreen, ImageOffersArrow, ImageRatingSmall,} from "../helpers/images";
import {COLOR_1, COLOR_10, COLOR_2, COLOR_5, COLOR_6, COLOR_8, COLOR_9, WRAPPER_PADDINGS,} from "../helpers/Variables";
import SingleParticipantBlock from "../includes/SingleParticipantBlock";
import MyInput from "../includes/MyInput";
import MyButton from "../includes/MyButton";
import moment from "moment";
import {Entypo} from "@expo/vector-icons";
import SelectDropdown from "react-native-select-dropdown";
import {useDispatch, useSelector} from "react-redux";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {workRequest} from "../../store/reducers/workRequestSlice";
import Modal from "react-native-modal";
import {showMessage} from "react-native-flash-message";
import {chatOrderRequest} from "../../store/reducers/chatDialogOrderSlice";
import * as Linking from "expo-linking";

const valuta = ["₽", "€", "$"];

function SendOffer(props) {
  const [price, setPrice] = useState(null);
  const [periodOfUsing, setPeriodOfUsing] = useState("");
  const [comment, setComment] = useState("");
  const [currency, setCurrency] = useState("");
  const [token, setToken] = useState("");
  const {route, navigation} = props;
  const {currentPage, item, id} = route.params;
  const date = moment(+item?.date_create?.$date.$numberLong).format("DD MMMM");
  const {loading, error} = useSelector((state) => state.workRequestSlice);
  const dispatch = useDispatch();

  useEffect(() => {
    AsyncStorage.getItem("token").then((result) => {
      if (result) {
        setToken(result);
      }
    });
  }, [token]);


  return (
    <Wrapper
      withContainer
      header={{
        currentPage,
        home: true,
        navigation,
      }}
    >
      <View style={styles.wrapper}>
        <View style={styles.infoBlock}>
          <View style={styles.row}>
            <View style={styles.locationInfo}>
              <Text style={styles.fromCity}>
                {item?.from_city?.title?.ru?.replace("(RU)", "")}
              </Text>
              <ImageOffersArrow/>
              <Text style={styles.toCity}>
                {item?.to_city?.title?.ru?.replace("(RU)", "")}
              </Text>
            </View>

            <Text style={styles.price}>
              {item.price > 0 && item.currency != null
               ? item.price.toString() + item.currency?.sign.toString()
               : "по запросу"}
            </Text>
          </View>
          <View style={styles.row}>
            <View>
              <Text style={styles.type}>{item?.type_container?.title}</Text>
              <Text style={styles.type}>{date}</Text>
            </View>
            <Text style={styles.dateAdded}>
              {moment(+item?.date_create?.$date.$numberLong).format(
                "YYYY-MM-DD"
              )}
            </Text>
          </View>
        </View>

        <View style={styles.company}>
          <Image
            style={styles.companyPhoto}
            source={{
              uri: item?.user?.avatar_person
                   ? "https://teus.online/" + item?.user?.avatar
                   : "https://vyshnevyi-partners.com/wp-content/uploads/2016/12/no-avatar.png",
            }}
          />
          <View style={styles.companyInfo}>
            <Text style={styles.companyName}>
              {item?.user.name || item?.user?.contact_person}
            </Text>
            <Text style={styles.companyCity}>
              {item?.user?.city?.title?.ru}
            </Text>
            <Text style={styles.companyPosition}>
              {item?.user?.post !== "undefined" && item?.user?.post}
            </Text>
            <View style={styles.companyRating}>
              <ImageRatingSmall/>
              <Text style={styles.companyRatingText}>
                {item.user.rate_plus}
              </Text>
            </View>
          </View>
        </View>
        <Text style={styles.header}>Контакты</Text>
        <View style={styles.contactsList}>
          <SingleParticipantBlock
            key={item.last_id}
            uri={
              item?.user?.avatar_person
              ? "https://teus.online/" + item?.user?.avatar_person
              : "https://vyshnevyi-partners.com/wp-content/uploads/2016/12/no-avatar.png"
            }
            button={{
              label: "Написать",
              onPress: () => {
                dispatch(
                  chatOrderRequest({token: token, id: item.user.last_id})
                )
                  .unwrap()
                  .then(() => {
                    navigation.navigate("DialogChat", {
                      currentPage: "Диалоги",
                      title: item.user.name,
                      id: item.user.last_id,
                    });
                  });
              },
            }}
            style={styles.contactsBlock}
          >
            <Text style={styles.name}>{item?.user?.contact_person}</Text>
            <Text style={styles.location}>
              {item?.user?.country?.title?.ru}
            </Text>
            <TouchableOpacity
              onPress={() => Linking.openURL("tel:" + item?.user?.phone)}
              style={styles.contacts}
            >
              <Text style={styles.contactsText}>{item?.user?.phone}</Text>
              <ImageCallGreen/>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => Linking.openURL("mailto:" + item?.user?.email)}
              style={styles.contacts}
            >
              <Text style={styles.contactsText}>{item?.user?.email}</Text>
              <ImageEmailGreen/>
            </TouchableOpacity>
          </SingleParticipantBlock>
        </View>

        <Text style={styles.header}>Направить предложение</Text>
        <MyInput
          label={"Ваша цена"}
          keyboardType={"numeric"}
          value={price}
          onChangeText={setPrice}
        />
        <MyInput
          label={"Срок пользования/перевозки, дней"}
          keyboardType={"numeric"}
          value={periodOfUsing}
          onChangeText={setPeriodOfUsing}
        />
        <MyInput
          label={"Комментарий"}
          value={comment}
          onChangeText={setComment}
          style={styles.commentInput}
          multiline
        />
        <View style={styles.containerStyle}>
          <SelectDropdown
            onSelect={setCurrency}
            defaultButtonText="Валюта"
            dropdownIconPosition="right"
            renderDropdownIcon={() => {
              return (
                <Entypo name="chevron-small-down" size={32} color={COLOR_1}/>
              );
            }}
            buttonTextStyle={{
              color: COLOR_1,
              fontSize: 14,
              textAlign: "left",
            }}
            buttonStyle={{height: 40, width: "100%", borderRadius: 8}}
            data={valuta}
            rowStyle={{
              flex: 1,
              justifyContent: "space-between",
              backgroundColor: "white",
              borderBottomColor: "white",
            }}
            rowTextStyle={{
              textAlign: "left",
              fontSize: 16,
            }}
          />
        </View>
        <MyButton
          style={styles.submitButton}
          onPress={() => {
            console.log(currency, 'currency')
            console.log(periodOfUsing)
            var form_data = new FormData();
            form_data.append("secret_token", token);
            form_data.append("last_id", item.last_id.toString());
            form_data.append("type", id);
            form_data.append("price", price);
            form_data.append(
              "currency",
              currency == "₽"
              ? "1"
              : currency == "$"
                ? "2"
                : currency == "€"
                  ? "3"
                  : ""
            );
            form_data.append("comment", comment);
            form_data.append("days", periodOfUsing);
            form_data.append("op", "enable");

            dispatch(workRequest(form_data))
              .unwrap()
              .then(async (res) => {
                if (res.success) {
                  await showMessage({
                    message: "Ваши данные успешно сохранены",
                    type: "success",
                  });
                  navigation.goBack();
                } else if (res.message == "Incorrect Details. You can not add comment") {
                  showMessage({
                    type: "info",
                    message: "Вы уже отправили запрос на это предложение",
                  });
                } else if (res.message == "Incorrect Details. Please try again") {
                  showMessage({
                    type: "denger",
                    message: "Что-то пошло не так, Попробуйте еще раз",
                  });
                }


                // if (res.success) {
                //   dispatch(
                //     chatOrderRequest({token: token, id: item.user.last_id})
                //   )
                //     .unwrap()
                //     .then(async () => {
                //       // await AsyncStorage.setItem("comment", comment);
                //       navigation.navigate("DialogChat", {
                //         currentPage: "Диалоги",
                //         title: item.user.name,
                //         id: item.user.last_id,
                //       });
                //     });
                // }
              })
              .catch((e) => {
                showMessage({
                  type: "danger",
                  message: "Что-то пошло не так, Попробуйте еще раз",
                });
              });
          }}
        >
          Направить предложение
        </MyButton>
      </View>
      {loading && (
        <Modal backdropOpacity={0.75} color="red" isVisible={true}>
          <View>
            <ActivityIndicator size="large"/>
          </View>
        </Modal>
      )}
    </Wrapper>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: WRAPPER_PADDINGS,
  },
  contactsList: {
    height: 200,
    marginBottom: 30,
  },
  contactsBlock: {
    borderBottomWidth: 1,
    borderBottomColor: COLOR_6,
    paddingBottom: 20,
  },
  containerStyle: {
    marginBottom: 30,
    backgroundColor: COLOR_10,
    borderRadius: 6,
    // height: 46,
    borderTopColor: "transparent",
    borderTopWidth: 1,
  },
  infoBlock: {
    paddingVertical: 30,
    borderBottomWidth: 1,
    borderBottomColor: COLOR_6,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  locationInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  fromCity: {
    marginRight: 10,
    color: COLOR_8,
    fontSize: 12,
    fontFamily: "GothamProMedium",
  },
  toCity: {
    marginLeft: 10,
    color: COLOR_8,
    fontSize: 12,
    fontFamily: "GothamProMedium",
  },
  price: {
    color: COLOR_5,
    fontSize: 12,
    fontFamily: "GothamProMedium",
    paddingVertical: 4,
    paddingHorizontal: 8,
    backgroundColor: COLOR_2,
    borderRadius: 10,
  },
  type: {
    color: COLOR_8,
    fontSize: 10,
    fontFamily: "GothamProRegular",
    marginBottom: 4,
  },
  dateAdded: {
    color: COLOR_9,
    fontSize: 10,
    fontFamily: "GothamProRegular",
    marginTop: 18,
    marginRight: 10,
  },
  company: {
    paddingVertical: 30,
    flexDirection: "row",
    alignItems: "center",
  },
  companyPhoto: {
    height: 80,
    width: 80,
    borderRadius: 50,
    marginRight: 30,
  },
  companyInfo: {},
  companyName: {
    color: COLOR_1,
    fontSize: 12,
    fontFamily: "GothamProRegular",
    marginBottom: 6,
  },
  companyCity: {
    color: COLOR_1,
    fontSize: 9,
    fontFamily: "GothamProRegular",
    marginBottom: 6,
  },
  companyPosition: {
    color: COLOR_1,
    fontSize: 9,
    fontFamily: "GothamProMedium",
    marginBottom: 10,
  },
  companyRating: {
    flexDirection: "row",
    alignItems: "center",
  },
  companyRatingText: {
    marginLeft: 4,
    color: COLOR_1,
    fontSize: 10,
    fontFamily: "GothamProRegular",
  },
  header: {
    fontSize: 9,
    fontFamily: "GothamProRegular",
    marginBottom: 20,
    color: COLOR_1,
  },
  contactLine: {
    flexDirection: "row",
    marginBottom: 10,
    alignItems: "center",
  },
  contactInfo: {
    fontSize: 9,
    fontFamily: "GothamProRegular",
    color: COLOR_1,
    marginLeft: 10,
  },
  contacts: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  contactsText: {
    fontSize: 12,
    fontFamily: "GothamProMedium",
    color: COLOR_1,
  },
  name: {
    marginBottom: 4,
  },
  location: {
    fontSize: 9,
    fontFamily: "GothamProRegular",
    color: COLOR_1,
    marginBottom: 20,
  },
  contactWrapper: {
    borderBottomColor: COLOR_6,
    borderBottomWidth: 1,
    paddingBottom: 30,
  },
  commentInput: {
    height: undefined,
    marginBottom: 20,
  },
  submitButton: {
    alignSelf: "center",
    marginBottom: 50,
  },
});

export default SendOffer;
