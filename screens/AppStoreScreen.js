import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Dimensions,
  Image,
  TouchableWithoutFeedback,
  Animated,
  Platform
} from 'react-native';

import { items } from '../data/items';


class AppStoreScreen extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            selectedItem : null,
            oldPosition : {
                x : null,
                y : null,
                width : null,
                height : null,
            }
        };

        this.allImages = [];
        this.viewImage = null;

        // MOCK ANIMATION VALUE FIR INTERPOLATING
        this.animate = new Animated.Value(0);

        this.positions = new Animated.ValueXY({x : 0, y : 0});
        this.dimensions = new Animated.ValueXY({x : 0, y : 0});
    }  

    handleSelect = (index) => {
        this.allImages[index].measure((x, y, width, height, pageX, pageY) => {
                
                // SAVE THE OLD POSITION
                this.setState({
                    oldPosition : {
                        x : pageX,
                        y : pageY,
                        width : width,
                        height : height,
                    }
                });

                // NEW IMAGE DIMENSIONS
                this.dimensions.setValue({
                    x : width,
                    y : height,
                });
                // NEW IMAGE POSITION
                this.positions.setValue({
                    x : pageX,
                    y : pageY,
                });

                this.setState({selectedItem : items[index]}, () => {

                    this.viewImage.measure((dx, dy, dwidth, dheight, dpageX, dpageY) => {
                        // ABSOLUTE CONTAINER MEASUREMENT
                        console.log(dx, dy, dwidth, dheight, dpageX, dpageY);

                        Animated.parallel([
                            Animated.timing(this.positions.x, {toValue : dpageX, duration : 500}),
                            Animated.timing(this.positions.y, {toValue : dpageY, duration : 500}),
                            Animated.timing(this.dimensions.x, {toValue : dwidth, duration : 500}),
                            Animated.timing(this.dimensions.y, {toValue : dheight, duration : 500}),
                            Animated.timing(this.animate, {toValue : 1, duration : 500})
                        ]).start()
                    })
                });

            })
      
    }
    
    render() {
        const absImageStyles = {
            width : this.dimensions.x, 
            height : this.dimensions.y, 
            top : this.positions.y, 
            left : this.positions.x,
        }

        const contentOpacity = this.animate.interpolate({
            inputRange : [0, 0.5],
            outputRange : [0 , 1],
        });

        const contentHeight = this.animate.interpolate({
            inputRange : [0, 1],
            outputRange : [0, Dimensions.get('window').height / 3]
        })

        return (
            <View style={styles.container}>
                <View style={{...styles.header}}>
                </View>
        
                <ScrollView contentContainerStyle={{padding : 10}}>
                {
                    items.map((item, index) =>
                    <View key={item.id} style={{...styles.shadowContainer}}>
                        <TouchableWithoutFeedback onPress={this.handleSelect.bind(this, index)}>
                            <View style={{...styles.itemContainer}}>
                                <Image
                                    ref={(image) => this.allImages[index] = image}
                                    source={item.image}
                                    style={{...styles.image}}
                                />
                    
                                <View style={{...styles.titleContainer}}>
                                    <Text style={{fontSize : 22, fontFamily : 'Montserrat-Light'}}>{item.title}</Text>
                                </View>
                            </View>
                        </TouchableWithoutFeedback>
        
                    </View>
                    )
                }
                </ScrollView>
        
                {/* ABSOLUTE POSITION DETAIL PAGE */}
                
                
                    <View 
                        style={{
                            ...StyleSheet.absoluteFill
                            }}
                            pointerEvents={this.state.selectedItem ? "auto" : "none"}
                        >
                        {/* IMAGE CONTAINER */}
                        <View style={{height : Dimensions.get('window').height * 2 / 3}} ref={(view) => (this.viewImage = view)}>
                            <Animated.Image 
                                source={this.state.selectedItem && this.state.selectedItem.image}
                                style={{ ...absImageStyles}} 
                            />
                        </View>

                        {/* CONTENT CONTAINER */}
                        <Animated.View 
                            style={{
                                height : contentHeight,
                                backgroundColor : 'white', 
                                opacity : contentOpacity,
                                
                                }}>

                        </Animated.View>

                    </View>
                

                

          
            </View>
            )
    }

};

const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    header : {
      height : Dimensions.get('window').height / 10,
      backgroundColor : '#f7f7f7'
    },
    shadowContainer : {
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 0,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,

        elevation: 5,
    },
    itemContainer : {
        height : Dimensions.get('window').height * 2 / 3,
        width : '100%',
        marginTop : 10,
        marginBottom : 15,
        borderRadius : 10,
        overflow : 'hidden',
        elevation : Platform.OS == 'android' ? 4 : 0,
    },
    titleContainer : {
        flex : 1,
        justifyContent : 'center',
        alignItems : 'center',
        backgroundColor : 'white',
    },
    image : {
        height : '90%',
        width : '100%',
        resizeMode : 'cover'
    },

});

export default AppStoreScreen;
  