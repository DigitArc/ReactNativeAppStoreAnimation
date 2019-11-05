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
  Platform,
  PanResponder,
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

        // MOCK ANIMATION VALUE FOR INTERPOLATING
        this.animate = new Animated.Value(0);

        this.positions = new Animated.ValueXY({x : 0, y : 0});
        this.dimensions = new Animated.ValueXY({x : 0, y : 0});

        // MOCK ANIMATION VALUE TO USE AT PANNING
        this.panAnimate = new Animated.Value(0);

        // PAN RESPONDER
        this._panResponder = PanResponder.create({
            onStartShouldSetPanResponder: (evt, gestureState) => {
                return true
            },

            // ON MOVE HANDLER
            onPanResponderMove: (evt, gestureState) => {
                const { dx, dy, moveX, moveY } = gestureState;
                
                this.panAnimate.setValue(dy);
            },

            // ON RELEASE HANDLER
            onPanResponderRelease: (evt, gestureState) => {
                if (this.panAnimate._value > 150) {
                    Animated.parallel([
                        Animated.spring(this.panAnimate, {toValue : 0, friction : 8}),
                        Animated.spring(this.positions.x, {toValue : this.state.oldPosition.x, friction : 8}),
                        Animated.spring(this.positions.y, {toValue : this.state.oldPosition.y, friction : 8}),
                        Animated.spring(this.dimensions.x, {toValue : this.state.oldPosition.width, friction : 8}),
                        Animated.spring(this.dimensions.y, {toValue : this.state.oldPosition.height, friction : 8}),
                        Animated.timing(this.animate, {toValue : 0, duration : 200})
                    ]).start(() => {
                        this.setState({
                            selectedItem : null
                        })
                    });
                } else {
                    Animated.spring(this.panAnimate, {toValue : 0, friction : 8}).start();
                }
            },

        });


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

                        Animated.parallel([
                            Animated.spring(this.positions.x, {toValue : dpageX, friction : 8   }),
                            Animated.spring(this.positions.y, {toValue : dpageY, friction : 8}),
                            Animated.spring(this.dimensions.x, {toValue : dwidth, friction : 8}),
                            Animated.spring(this.dimensions.y, {toValue : dheight, friction : 8}),
                            Animated.spring(this.animate, {toValue : 1, friction : 10})
                        ]).start();
                    })
                });

            })
      
    };

    handleClose = () => {
        Animated.parallel([
            Animated.spring(this.positions.x, {toValue : this.state.oldPosition.x, friction : 8}),
            Animated.spring(this.positions.y, {toValue : this.state.oldPosition.y, friction : 8}),
            Animated.spring(this.dimensions.x, {toValue : this.state.oldPosition.width, friction : 8}),
            Animated.spring(this.dimensions.y, {toValue : this.state.oldPosition.height, friction : 8}),
            Animated.spring(this.animate, {toValue : 0, friction : 6})
        ]).start(() => {
            this.setState({
                selectedItem : null
            })
        });
    };   
    
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

        const imageBorderRadius = this.animate.interpolate({
            inputRange : [0, 0.5, 1],
            outputRange : [15, 15, 0],
            extrapolate : 'clamp'
        })

        const contentHeight = this.animate.interpolate({
            inputRange : [0, 1],
            outputRange : [0, Dimensions.get('window').height / 3]
        });

        const translateYVal = this.panAnimate.interpolate({
            inputRange : [0, 300],
            outputRange : [0 , 300],
            extrapolate : 'clamp',
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
                        <View {...this._panResponder.panHandlers} style={{height : Dimensions.get('window').height * 2 / 3}} ref={(view) => (this.viewImage = view)}>
                            <Animated.Image
                                source={this.state.selectedItem && this.state.selectedItem.image}
                                style={{ 
                                    ...absImageStyles,
                                    borderRadius : imageBorderRadius,
                                    transform : [{translateY : translateYVal}]
                                }} 
                            />

                            {/* HANDLE CLOSE EVENT */}
                            <TouchableWithoutFeedback onPress={this.handleClose}>
                                <Animated.View style={{position : 'absolute', top : 50, right : 40, opacity : contentOpacity}}>
                                    <Text style={{fontSize : 25, color : 'white', fontFamily : 'Montserrat'}}>X</Text>
                                </Animated.View>
                            </TouchableWithoutFeedback>
                        </View>

                        {/* CONTENT CONTAINER */}
                        <Animated.View 
                            style={{
                                height : contentHeight,
                                backgroundColor : 'white', 
                                opacity : contentOpacity,
                                padding : 12,
                                transform : [{translateY : translateYVal}],
                            
                                }}>
                                {/* TITLE */}
                                <Text style={{fontFamily : 'Montserrat-Light', fontSize : 25, marginBottom : 10}}>{ this.state.selectedItem && this.state.selectedItem.title }</Text>
                                {/* DESCRIPTION */}
                                <Text style={{fontFamily : 'Montserrat-Light', fontSize : 15}}>{ this.state.selectedItem && this.state.selectedItem.description }</Text>
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
  