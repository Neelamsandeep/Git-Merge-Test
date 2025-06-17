import { useNavigation } from "@react-navigation/native";
import ThankYouPageImage from "../../assets/Cart/thankYou.gif";
import { Image, StyleSheet, Text, TouchableOpacity, View, Dimensions, StatusBar } from 'react-native';
import { Package, ArrowRight } from "lucide-react-native";

const { width, height } = Dimensions.get('window');

const CartThankYouPage = () => {
    const navigation = useNavigation();

    return (
        <View style={styles.container}>
            <View style={styles.contentContainer}>
                <View style={styles.imageContainer}>
                    <Image
                        source={ThankYouPageImage}
                        style={styles.thankYouImage}
                        resizeMode="contain"
                    />
                </View>

                <View style={styles.textContainer}>
                    <Text style={styles.thankYouTitle}>Thank You for Your Purchase!</Text>
                    <Text style={styles.successMessage}>Your order has been placed successfully.</Text>
                    <Text style={styles.subMessage}>
                        We're preparing your items with care and will notify you once they're on their way.
                    </Text>
                </View>

                <View style={styles.orderInfoCard}>
                    <Package size={24} color="#3d1614" style={{ marginRight: 10 }} />
                    <Text style={styles.orderInfoText}>
                        You'll receive order updates via email and SMS
                    </Text>
                </View>

                <TouchableOpacity
                    style={styles.trackButton}
                    onPress={() => navigation.navigate("MainHome", { screen: "My Orders" })}
                    activeOpacity={0.8}
                >
                    <View style={styles.trackButtonGradient}>
                        <Text style={styles.trackButtonText}>Track Your Orders</Text>
                        <ArrowRight size={20} color="#fff" />
                    </View>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.continueButton}
                    onPress={() => navigation.navigate("MainHome")}
                    activeOpacity={0.7}
                >
                    <Text style={styles.continueButtonText}>Continue Shopping</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default CartThankYouPage;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fcfbf2',
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: StatusBar.currentHeight || height * 0.05,
    },
    contentContainer: {
        width: '90%',
        alignItems: 'center',
    },
    imageContainer: {
        width: '100%',
        alignItems: 'center',
        marginBottom: height * 0.025,
    },
    thankYouImage: {
        width: width * 0.7,
        height: height * 0.3,
    },
    textContainer: {
        alignItems: 'center',
        marginBottom: height * 0.03,
    },
    thankYouTitle: {
        fontSize: width * 0.06,
        fontWeight: '700',
        color: '#3d1614',
        marginBottom: height * 0.01,
        textAlign: 'center',
    },
    successMessage: {
        fontSize: width * 0.04,
        color: '#666',
        marginBottom: height * 0.005,
        textAlign: 'center',
    },
    subMessage: {
        fontSize: width * 0.035,
        color: '#999',
        textAlign: 'center',
        paddingHorizontal: width * 0.05,
        lineHeight: height * 0.03,
    },
    orderInfoCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f8f8f8',
        padding: width * 0.035,
        borderRadius: width * 0.025,
        borderWidth: 1,
        borderColor: '#f0f0f0',
        marginBottom: height * 0.03,
        width: '100%',
    },
    orderInfoText: {
        fontSize: width * 0.035,
        color: '#3d1614',
        flexShrink: 1,
        marginLeft: width * 0.025,
    },
    trackButton: {
        width: '100%',
        backgroundColor: '#3d1614',
        paddingVertical: height * 0.018,
        borderRadius: width * 0.025,
        marginBottom: height * 0.02,
    },
    trackButtonGradient: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: width * 0.05,
    },
    trackButtonText: {
        color: '#fff',
        fontSize: width * 0.04,
        fontWeight: '600',
    },
    continueButton: {
        backgroundColor: '#f8d641',
        paddingVertical: height * 0.016,
        borderRadius: width * 0.025,
        width: '100%',
    },
    continueButtonText: {
        color: '#3d1614',
        fontSize: width * 0.04,
        fontWeight: '600',
        textAlign: 'center',
    },
});
