const express = require("express");
const admin = require("firebase-admin");

const app = express();
app.use(express.json());

// 🔥 CONECTAR FIREBASE
const serviceAccount = require("./chave.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// 🔥 SOMAR 30 DIAS
function add30(dataAtual){
  const hoje = new Date();
  let base;

  if(dataAtual && new Date(dataAtual) > hoje){
    base = new Date(dataAtual);
  } else {
    base = hoje;
  }

  base.setDate(base.getDate() + 30);
  return base;
}

// 🔥 WEBHOOK HOTMART
app.post("/webhook", async (req, res) => {

  const data = req.body;

  if(data.status === "approved"){

    const email = data.data.buyer.email;

    const ref = db.collection("usuarios").doc(email);
    const doc = await ref.get();

    let novaData;

    if(doc.exists){
      novaData = add30(doc.data().expira_em);
    } else {
      novaData = add30(null);
    }

    await ref.set({
      email: email,
      expira_em: novaData.toISOString()
    });

    console.log("Liberado:", email);
  }

  res.send("OK");
});

app.listen(3000, ()=> console.log("rodando"));