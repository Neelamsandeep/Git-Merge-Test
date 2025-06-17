import { useNavigation, useRoute } from "@react-navigation/native"
import { CreditCard } from "lucide-react-native"
import { useEffect, useRef, useState } from "react"
import { Dimensions, Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native"
import { useDispatch, useSelector } from "react-redux"
import { getCart } from "../../Redux/addCartSlice"
import { getAddress } from "../../Redux/addressSlice"
import store from "../../Redux/stores/store"
import FetchWithAuth from "../../Redux/utils/fetchwithAuth"
import WebView from "react-native-webview"
import Toast from "react-native-toast-message"

const { width, height } = Dimensions.get('window');

const PaymentPage = () => {
  const navigation = useNavigation()
  const webViewRef = useRef(null);
  const [activePaymentOption, setActivePaymentOption] = useState("");
  const [razorpayOrderData, setRazorpayOrderData] = useState(null)

  const { userloginId, name, phone } = useSelector((state) => state.auth)
  const { cartdata } = useSelector((state) => state.cart)
  const { zohoCustomerId } = useSelector((state) => state.address)
  const dispatch = useDispatch()

  useEffect(() => {
    if (!zohoCustomerId && userloginId) {
      dispatch(getAddress({ userLoginId: userloginId, store }));
    }
  }, [zohoCustomerId, userloginId, dispatch]);

  const route = useRoute()
  const { totalAmount, selectedAddress } = route.params

  const handleOptionClick = async (option) => {
    setActivePaymentOption((prev) => (prev === option ? "" : option));
    if (option === "upi" && !razorpayOrderData) {
      await handleGetOrderDetails();
    }
  };

  const handleGetOrderDetails = async () => {
    const amountinPaise = totalAmount * 100
    const res = await FetchWithAuth("/zohopayment/orderpayment", {
      method: "POST",
      body: JSON.stringify({
        amount: amountinPaise,
        userLoginId: userloginId
      })
    }, store)

    const data = await res.json()
    setRazorpayOrderData(data.orders)
  }

  const htmlContent = razorpayOrderData ? `
    <html>
    <head>
      <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
      <script>
        function makePayment() {
          var options = {
            key: "rzp_test_oUzVtWfevfmp8q",
            amount: ${razorpayOrderData.amount},
            currency: "INR",
            name: "Aaa Food",
            description: "Food Order Payment",
            order_id: "${razorpayOrderData.id}",
           handler: function(response) {
          window.ReactNativeWebView.postMessage(JSON.stringify({
            status: "success",
            ...response
          }));
        },
        modal: {
          ondismiss: function () {
            window.ReactNativeWebView.postMessage(JSON.stringify({
              status: "cancelled"
            }));
          }
        },
            notes: { address: "Aaa Corporate Office" },
            theme: { color: "#3d1614" }
          };
          var rzp1 = new Razorpay(options);
          rzp1.open();
        }
        window.onload = makePayment;
      </script>
    </head>
    <body></body>
    </html>
  `: null;

  const handlePayement = async (razorPay, cartdata) => {
    console.log("handle payment: ", razorPay)
    console.log(cartdata)
    const verifyRes = await FetchWithAuth("/zohopayment/verifyRazor", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        razorpay_order_id: razorPay.razorpay_order_id,
        razorpay_payment_id: razorPay.razorpay_payment_id,
        razorpay_signature: razorPay.razorpay_signature,
        userLoginId: userloginId,
        cartData: cartdata,
        zohoaddress_id: selectedAddress.address_id,
        zohoCustomerId: zohoCustomerId
      }),
    }, store);

    const verifyData = await verifyRes.json();
    Toast.show({
      type: "success",
      text1: `Huurah! Payment success - ${verifyData}`,
      text2: "Please wait we will send your order as soon as possiable"
    })
  }

  const handleCODPayment = async () => {
    try {
      const res = await FetchWithAuth("/zohopayment/CashOnDeliveryOrder", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          userLoginId: userloginId,
          cartData: cartdata,
          zohoaddress_id: selectedAddress.address_id,
          zohoCustomerId: zohoCustomerId
        })
      }, store);

      const data = await res.json();

      if (data.success) {
        Toast.show({
          type: "success",
          text1: "Cash on Delivery order placed!",
          text2: "Please wait we will send your order as soon as possiable"
        })
        navigation.navigate("successPage")
      } else {
        toast.error("COD order failed. Please try again.");
      }
    } catch (error) {
      console.error("COD Error:", error);
      Toast.show({
        type: "error",
        text1: "Something went wrong while placing COD order.",
        text2: "Please try again after some time"
      })
    }
  };

  const handleWebViewMessage = async (event) => {
    const response = JSON.parse(event.nativeEvent.data);
    console.log("WebView Response:", response);

    if (response.status === "cancelled") {
      Toast.show({
        type: "info",
        text1: "Payment cancelled",
        text2: "You exited the Razorpay screen"
      });
      setActivePaymentOption("");
      return;
    }

    if (response.status === "success") {
      await dispatch(getCart({ userloginId, store }));

      const razorPay = {
        razorpay_order_id: response.razorpay_order_id,
        razorpay_payment_id: response.razorpay_payment_id,
        razorpay_signature: response.razorpay_signature
      };

      await handlePayement(razorPay, cartdata);
      navigation.navigate("successPage");
    }
  };

  return (
    <View style={styles.paymentContainer}>
      <View style={styles.mainContainer}>
        <View style={styles.headingContainer}>
          <Text style={styles.headingText}>Pick Your Pay Style</Text>
        </View>

        <View style={styles.addressContainer}>
          <View style={styles.leftaddress}>
            <View style={styles.smallcircle}></View>
            <View style={styles.smallverticalLine}></View>
            <View style={styles.smallcircle}></View>
          </View>
          <View style={styles.rightaddress}>
            <Text style={styles.leftText}>From</Text>
            <Text style={styles.rightText}>| Yours Selected Store </Text>
            <Text style={styles.leftText}>Yours</Text>
            <Text style={styles.rightText}>| {selectedAddress?.address || "No address selected"}</Text>
          </View>
        </View>

        <View style={styles.moreSection}>
          <TouchableOpacity
            style={styles.payondelivery}
            onPress={() => handleOptionClick("upi")}
          >
            <CreditCard />
            <Text style={styles.payondeliveryText}>Pay on UPI/Card</Text>
          </TouchableOpacity>


          <View style={styles.payondelivery} onTouchEnd={() => handleOptionClick("pod")}>
            <CreditCard />
            <Text style={styles.payondeliveryText}>Pay on Delivery (Cash/UPI)</Text>
          </View>
        </View>

        {activePaymentOption === "pod" && (
          <View style={styles.proceed}>
            <TouchableOpacity style={styles.proceedButton} onPress={handleCODPayment}>
              <Text>Final Swipe</Text>
            </TouchableOpacity>
          </View>
        )}

        {activePaymentOption === "upi" && razorpayOrderData && (
          <Modal
            visible={true}
            animationType="slide"
            transparent
          >
            <WebView
              ref={webViewRef}
              originWhitelist={["*"]}
              source={{ html: htmlContent }}
              javaScriptEnabled
              domStorageEnabled
              onMessage={handleWebViewMessage}
            />
          </Modal>
        )}

      </View>
    </View>
  )

}

export default PaymentPage

const styles = StyleSheet.create({
  paymentContainer: {
    flex: 1,
    backgroundColor: "#fcfbf2",
    paddingHorizontal: width * 0.04,
    paddingTop: height * 0.035,
  },
  mainContainer: {
    flex: 1,
  },
  headingContainer: {
    marginBottom: height * 0.025,
    alignItems: "center",
  },
  headingText: {
    fontSize: width * 0.06,
    fontWeight: "700",
    color: "#3d1614",
  },
  addressContainer: {
    flexDirection: "row",
    marginBottom: height * 0.04,
  },
  leftaddress: {
    alignItems: "center",
    marginRight: width * 0.03,
    marginTop: height * 0.005,
  },
  smallcircle: {
    width: width * 0.025,
    height: width * 0.025,
    borderRadius: width * 0.0125,
    backgroundColor: "#F8D641",
    marginVertical: height * 0.003,
  },
  smallverticalLine: {
    width: 2,
    height: height * 0.05,
    backgroundColor: "#ccc",
  },
  rightaddress: {
    flex: 1,
    justifyContent: "center",
  },
  leftText: {
    fontSize: width * 0.035,
    fontWeight: "600",
    color: "#888",
    marginBottom: height * 0.003,
  },
  rightText: {
    fontSize: width * 0.035,
    color: "#3d1614",
    fontWeight: "500",
    marginBottom: height * 0.005,
  },
  moreSection: {
    marginTop: height * 0.02,
  },
  payondelivery: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: width * 0.04,
    borderRadius: width * 0.035,
    marginBottom: height * 0.02,
    borderWidth: 1,
    borderColor: "#f0f0f0",
    elevation: 3,
    shadowColor: "#3d1614",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  payondeliveryText: {
    fontSize: width * 0.04,
    marginLeft: width * 0.03,
    color: "#3d1614",
    fontWeight: "600",
  },
  proceed: {
    marginTop: height * 0.04,
    alignItems: "center",
  },
  proceedButton: {
    backgroundColor: "#F8D641",
    paddingVertical: height * 0.018,
    paddingHorizontal: width * 0.1,
    borderRadius: width * 0.03,
    elevation: 5,
    shadowColor: "#F8D641",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  proceedButtonText: {
    fontSize: width * 0.045,
    fontWeight: "700",
    color: "#3d1614",
  },
});
