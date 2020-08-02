const express = require("express");
const ejs = require("ejs");
const paypal = require("paypal-rest-sdk");
const { payment } = require("paypal-rest-sdk");

paypal.configure({
  mode: "sandbox", //sandbox or live
  client_id:
    "AercT56wnO9gs8bbaY6nswEsh9zF7MeTeWe5GTA0U_s1pHHm-NGGIFoLJvgjcB0tYZRDGR-ulJzEN_VG",
  client_secret:
    "EGCif5LhuXhhsNwLDiUW3Tu4i3vZlUpE_b26_Jwam9UMA7BHRevOSIP9Hi78Yx2tjQG3heQwkMerfZPC",
});

const app = express();

app.set("view engine", "ejs");

app.get("/", (req, res) => res.render("index"));
app.post("/pay", (req, res) => {
  const create_payment_json = {
    intent: "sale",
    payer: {
      payment_method: "paypal",
    },
    redirect_urls: {
      return_url: "http://localhost:3000/success",
      cancel_url: "http://localhost:3000/cancel",
    },
    transactions: [
      {
        item_list: {
          items: [
            {
              name: "Red shoes",
              sku: "001",
              price: "50.00",
              currency: "USD",
              quantity: 1,
            },
          ],
        },
        amount: {
          currency: "USD",
          total: "50.00",
        },
        description: "Get your red shoes to look good in the public",
      },
    ],
  };
  paypal.payment.create(create_payment_json, function (error, payment) {
    if (error) {
      throw error;
    } else {
      for (let i = 0; i < payment.links.length; i++) {
        if (payment.links[i].rel === "approval_url") {
          res.redirect(payment.links[i].href);
        }
      }
    }
  });
});

app.get("/success", (req, res) => {
  const payerId = req.query.PayerID;
  const paymentId = req.query.paymentId;
  const execute_payment_json = {
    payer_id: payerId,
    transactions: [
      {
        amount: {
          currency: "USD",
          total: "50.00",
        },
      },
    ],
  };
  paypal.payment.execute(paymentId, execute_payment_json, (error, payment) => {
    if (error) {
      console.log(error.response);
      throw errow;
    } else {
      console.log("Get Payment Response");
      //   console.log(JSON.stringify(payment));
      res.send("success");
    }
  });
});
app.get("/cancel", (req, res) => res.send("cancel"));

const PORT = process.env.PORT || 3000;

app.listen(PORT, console.log(`app running on port ${PORT}`));
