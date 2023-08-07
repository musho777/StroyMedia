import React, {useEffect, useState} from "react";
import {ActivityIndicator, FlatList, Image, Modal, StyleSheet, Text, TouchableOpacity, View,} from "react-native";
import Wrapper from "../helpers/Wrapper";
import {useDispatch, useSelector} from "react-redux";
import NavBar from "../includes/NavBar";
import {Search} from "../includes/Search";
import FilterItem from "../includes/FilterItem";
import ParticipantItem from "../includes/ParticipantItem";
import {COLOR_1, COLOR_10, COLOR_3, COLOR_5, WRAPPER_PADDINGS,} from "../helpers/Variables";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {getCitys} from "../../store/reducers/getCitysSlice";
import {Entypo} from "@expo/vector-icons";
import {getMembersRequest} from "../../store/reducers/getMembersDataSlice";
import {getFavoriteMembers} from "../../store/reducers/getFavoriteMembers";

const SearchIcon = require("../../assets/search.png");

function Participants({route, navigation}) {
  const tabs = ["Все", "Избранное"];
  const [activeTab, setActiveTab] = useState("Все");
  const [searchValue, setSearchValue] = useState("");
  const [citys, setCitys] = useState([]);
  const [page, setPage] = useState(1);
  const [offset, setOffset] = useState(null);
  const [cityId, setCityId] = useState();
  const [token, setToken] = useState();
  const [role, setRole] = useState("");
  const [cityName, setCityName] = useState("");
  // const [liked, setLiked] = useState(false);
  const state = useSelector((state) => state);
  const [searchFavoriteData,setSearchFavoriteData] = useState([])
  const {data, favoriteList, loading} = state.getMembersSlice;
  const {currentPage} = route.params;
  const [first,setFirst] = useState(false)
  const dispatch = useDispatch();
  const favoriteData = useSelector((state) => state.getFavoriteMembersSlicer);
  let liked = false;
  const [newfavoriteData,setNewfavoriteData] = useState([])
  useEffect(()=>{
      setNewfavoriteData(favoriteData.data)
  },[favoriteData.data])
  useEffect(() => {
    AsyncStorage.getItem("token").then((result) => {
      setFirst(true)
      if (result) {
        setToken(result);
        dispatch(getFavoriteMembers(token))
        dispatch(
          getMembersRequest({
            token: result,
            offset,
            city: cityId ? cityId : null,
            role: role ? role : null,
          })
        );
      }
    });

    dispatch(getCitys())
      .unwrap()
      .then((result) => {
        setCitys(result.data.data.citys);
      });
  }, [navigation]);


  useEffect(()=>{
    if(activeTab === 'Избранное'){
      dispatch(getFavoriteMembers(token))      
    }
  },[activeTab])


  const addRemoveItem = (type,id) =>{
    let item = [...newfavoriteData]
    if(type === 'add'){
      let i = data.findIndex((item)=>item.last_id == id);
      item.push(data[i])
    }
    if(type === 'remove'){
      item.splice(id,1)
    }
    setNewfavoriteData(item)
  }

  const resetText = () => {
    // setSearchValue("");
    filtered("");
  };

  const resetFiltered = () => {
    setCityId(null);
    // filtered("");
    setRole("");
    setCityName("");
  };

  useEffect(() => {
    if(first){
      dispatch(
        getMembersRequest({
          token,
          offset,
          city: cityId ? cityId : null,
          role: role ? role : null,
        })
      );
    }
  }, [offset,activeTab]);

  const nextPage = () => {
    setOffset(offset + 5);
    setPage(page + 1);
  };

  const previusPage = () => {
    setOffset(offset - 5);
    setPage(page - 1);
  };

  const filtered = (id, role, companyName = null) => {
    setPage(1);
    setOffset(null);
    dispatch(
      getMembersRequest({token, offset: null, role, city: id, companyName})
    );
    if(activeTab == 'Избранное'){
      let item = [...searchFavoriteData]
      if(searchValue !== ''){
        newfavoriteData.map((elm,i)=>{
          if(elm.name.includes(searchValue)){
            item.push(elm)
          }
        })
      setNewfavoriteData(item)
      }
      else {
        setNewfavoriteData(favoriteData.data)
      }
     
      // dispatch(getFavoriteMembers(token))
    }
  };

  return (
    <Wrapper
      withContainer
      header={{
        currentPage,
        home: true,
        navigation,
      }}
    >
      <NavBar
        onPress={(tab) => {
          resetFiltered();
          setActiveTab(tab);
          setSearchValue("");
          // setOffset(null);
        }}
        tabs={tabs}
        activeTab={activeTab}
      />
      <View style={styles.wrapper}>
        <Modal visible={loading} transparent>
          <View
            style={{
              flex: 1,
              backgroundColor: "#00000055",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <ActivityIndicator size={50} color={COLOR_5}/>
          </View>
        </Modal>
        <View style={styles.searchRow}>
          <Search
            style={styles.search}
            value={searchValue}
            onSearchText={(val) => {
              val === "" && resetFiltered();
              setSearchValue(val);
            }}
            resetText={resetText}
          />
          <TouchableOpacity
            activeOpacity={0.2}
            onPress={() => {
              filtered(cityId, role, searchValue);
              // setSearchValue("");
            }}
          >
            <Image source={SearchIcon} style={{width: 25, height: 25}}/>
          </TouchableOpacity>
        </View>
        <View style={styles.filtersRow}>
          {activeTab === "Все" ? (
            <>
              <FilterItem
                isCitys={false}
                title={role ? role : "Профиль деятельности"}
                options={[
                  "Собственник КТК",
                  "Экспедитор-sender",
                  "Собственник ПС",
                  "Грузовладелец",
                  "Морская линия",
                  "Другое",
                ]}
                onSelect={(option) => {
                  setRole(option.title);
                  filtered(cityId, option.title, searchValue);
                  setSearchValue("");
                }}
              />
              <FilterItem
                isCitys
                title={cityName ? cityName : "Город"}
                options={citys}
                onSelect={(option) => {
                  setCityId(option?.last_id);
                  filtered(option.last_id, role, searchValue);
                  setCityName(option.title);
                  setSearchValue("");
                }}
              />
            </>
          ) : null}
        </View>
        {(role || cityName) && activeTab === "Все" ? (
          <TouchableOpacity onPress={resetFiltered} style={styles.resetButton}>
            <Text style={styles.resetText}>Сброс x</Text>
          </TouchableOpacity>
        ) : null}
      </View>
      <FlatList
        data={
          activeTab !== 'Избранное'? data :newfavoriteData
        }
        ListEmptyComponent={() => {
          if(activeTab !== 'Избранное'){
            return <Text style={styles.empty}>ничего не найдено</Text>;
          }
          else if(activeTab === 'Избранное' && searchValue){
            return <Text style={styles.empty}>ничего не найдено</Text>;
          }
          else if (activeTab === 'Избранное' && !searchValue){
            return <Text style={styles.empty}>У Вас нет избранных</Text>;
          }
        }}
        renderItem={({item, index}) => {
          return (
            <View
              style={{
                flex: 1,
                marginHorizontal: 20,
                justifyContent: "space-between",
              }}
            >
              <ParticipantItem
                likedList={newfavoriteData.findIndex( (element) => element.last_id === item.last_id)>=0}
                favorites={activeTab}
                imageUri={`https://teus.online/${item?.avatar}`}
                companyName={item?.name || item?.contact_person}
                city={item?.factadress ? item?.factadress : "нет данных"}
                doingProfile={item?.inn}
                navigation={navigation}
                id={item?.last_id}
                index={index}
                addRemoveItem = {(type,i)=>addRemoveItem(type,i)}
              />
            </View>
          );
        }}
      />
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 20,
        }}
      >
        {activeTab !== "Избранное" && data?.length > 4 ? (
          <>
            <View>
              <TouchableOpacity
                disabled={page === 1 ? true : false}
                onPress={previusPage}
              >
                <Entypo name="chevron-left" size={28} color={"gray"}/>
              </TouchableOpacity>
            </View>
            <View>
              <View style={styles.pageCount}>
                <Text style={styles.count}>{page}</Text>
              </View>
            </View>
            <View>
              <TouchableOpacity
                disabled={data.length === 5 ? false : true}
                onPress={nextPage}
              >
                <Entypo name="chevron-right" size={28} color={"gray"}/>
              </TouchableOpacity>
            </View>
          </>
        ) : null}
      </View>
    </Wrapper>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: WRAPPER_PADDINGS,
  },
  count: {
    color: "white",
  },
  pageCount: {
    width: 25,
    height: 25,
    backgroundColor: COLOR_3,
    borderRadius: 5,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 16,
  },
  searchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: -20,
  },
  search: {
    width: "90%",
  },
  filtersRow: {
    flexDirection: "row",
  },
  resetButton: {
    bottom: -10,
    height: 30,
    width: 80,
    backgroundColor: COLOR_10,
    borderRadius: 5,
    alignItems: "center",
    justifyContent: "center",
  },
  resetText: {
    fontSize: 12,
    color: "red",
    fontFamily: "GothamProRegular",
  },
  empty: {
    fontSize: 22,
    color: COLOR_1,
    fontFamily: "GothamProRegular",
    textAlign: "center",
    marginTop: 40,
  },
});

export default Participants;
