import * as React from 'react';
import { Text, View, StyleSheet, Button, ScrollView, TextInput } from 'react-native';
import {
  Card,
} from 'react-native-elements';
import * as Permissions from 'expo-permissions';
import Modal, { ModalContent,SlideAnimation } from 'react-native-modals';
import { BarCodeScanner } from 'expo-barcode-scanner';
import Axios from 'axios';
import styles from "./style";

export default class Barcode extends React.Component {
  state = {
    hasCameraPermission: null,
    scanned: false,
    user:null,
    token:null,
    storeId:"",
    item:{},
    adminVis:false,
    userVis:false,
    itemName:"",
    itemPrice:0,
    itemDiscount:0
  };
  static navigationOptions = {
    title: "CashMeOutside",
  };

  async componentDidMount() {
    this.getPermissionsAsync();
    this.setState({
      user:this.props.navigation.state.params.user,
      token:this.props.navigation.state.params.token,
      storeId:this.props.navigation.state.params.storeId
    });
  }

  getPermissionsAsync = async () => {
    const { status } = await Permissions.askAsync(Permissions.CAMERA);
    this.setState({ hasCameraPermission: status === 'granted' });
  };
  
  render() {
    const userId=this.props.navigation.state.params.user._id;
   
    const { hasCameraPermission, scanned } = this.state;

    if (hasCameraPermission === null) {
      return <Text>Requesting for camera permission</Text>;
    }
    if (hasCameraPermission === false) {
      return <Text>No access to camera</Text>;
    }
    return (
      <View
        style={{
          flex: 1,
          flexDirection: 'column',
          justifyContent: 'flex-end',
        }}>
        
        <Text>Scan the barcode of the item you want!</Text>
        <BarCodeScanner
          onBarCodeScanned={scanned ? undefined : this.handleBarCodeScanned}
          style={StyleSheet.absoluteFillObject}
        />
        <Modal
        visible={this.state.adminVis}
        modalAnimation={new SlideAnimation({
          slideFrom: 'top',
        })}
        onTouchOutside={() => {
          this.setState({ visible: false });
        }}
        >  
        <ModalContent style={styles.modalstyle}>
        <TextInput
             placeholder="Item Name" placeholderColor="#c4c3cb"
              onChange={(e)=>{
                this.setState({
                  itemName:e.nativeEvent.text
                })
              }} 
            />
            <TextInput
             placeholder="price" placeholderColor="#c4c3cb"
              style={styles.loginFormTextInput}
              onChange={(e)=>{
                this.setState({
                  ItemPrice:e.nativeEvent.text
                })
              }} 
            />
            <TextInput
            placeholder="discount" placeholderColor="#c4c3cb"
            style={styles.loginFormTextInput}
            onChange={(e)=>{
              this.setState({
                itemDiscount:e.nativeEvent.text
              })
            }} 
            />

            <Button title="submit"
            onPress={()=>{
               Axios.post(`https://smartcheckoutbackend.herokuapp.com/api/store/${this.state.storeId}/items`, {
                 name:this.state.itemName,
                 price:this.state.ItemPrice,
                 discount:this.state.itemDiscount,
                 barcode:123456789101,
               })
                      .then(res=>{
                        console.log(res.data.data)
                        alert("added to Store!")
                      })
                      .catch(error=>{
                        const err= error.response.data.message||error.response.data.msg
                        console.log(err);
                        this.setState({error:err});
                        alert(this.state.error)
                      })
            }}
            />
        </ModalContent>

      </Modal>
      <Modal
        visible={this.state.userVis}
        modalAnimation={new SlideAnimation({
          slideFrom: 'top',
        })}
        onTouchOutside={() => {
          this.setState({ visible: false });
        }}
        >  
        <ModalContent>
                  <Text>Name: {this.state.item.name}</Text>
                    <Text>Price: {this.state.item.price}</Text>
                    <Text>Discount : {this.state.item.discount}</Text>
                   <Button title={"Add to Cart"} 
                    onPress={()=>{
                      //toDo call route to add to cart
                      Axios.post(`https://smartcheckoutbackend.herokuapp.com/api/user/${userId}/cart/item`, this.state.item)
                      .then(res=>{
                        console.log(res.data.data)
                        alert("added to cart!") 
                      })
                      .catch(error=>{
                        console.log(error)
                        const err= error.response.data.message||error.response.data.msg
                        console.log(err);
                        this.setState({error:err});
                        alert(this.state.error)
                      })
                  }
                }
                    />
                    <Button title="Cancel"
                    buttonStyle={styles.cancelButton}
                    onPress={()=>{
                      this.setState({userVis:false})
                  }
                }
                    />
        </ModalContent>
      </Modal>
        {scanned && (
          <Button title={'Tap to Scan Again'} onPress={() => this.setState({ scanned: false })} />
        )}
      </View>
    );
  }

  handleBarCodeScanned = ({ type, data }) => {
    //alert(`Bar code with type ${type} and data ${data} has been scanned!`);
    Axios.get(`https://smartcheckoutbackend.herokuapp.com/api/store/${this.props.navigation.state.params.storeId}/items/${data}`)
    .then(res=>{
      this.setState({
        item:res.data.data
      })
      this.setState({ scanned: true });
      const user=this.props.navigation.state.params.user;
      if(user.isAdmin)
        this.setState({adminVis:true})
      else{
        this.setState({userVis:true})
      }
    })
    .catch(error=>{
      const err= error.response.data.message||error.response.data.msg
      console.log(err);
      this.setState({error:err});
      alert(this.state.error)
    })
   
  };
}

