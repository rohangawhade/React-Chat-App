import React, { useState, useRef, useEffect } from 'react';
import './App.css';

import firebase from 'firebase/app';
import 'firebase/firestore';
import 'firebase/auth';

import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollectionData } from 'react-firebase-hooks/firestore';

firebase.initializeApp({
})

const auth = firebase.auth();
const firestore = firebase.firestore();

function App() {

  const [user] = useAuthState(auth);

  return (
    <div className="App">
      <header>
        <h1>ChatApp</h1>
        <SignOut />
      </header>

      <section>
        { user ? <ChatRoom /> : <SignIn /> }
      </section>
    </div>
  );
}

function SignIn(){

  const signInWithGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider);
  }

  return(
    <>
      <button className="sign-in" onClick={signInWithGoogle} >Sign in with Google</button>
      {/* <p>Do not violate the community guidelines or you will be banned for life!</p> */}
    </>
  )
}

function SignOut(){
  return auth.currentUser && (
    <button className="sign-out" onClick={() => auth.signOut()} >Sign Out</button>
  )
}

function ChatRoom(){
  const dummy = useRef(null);
  const messagesRef = firestore.collection('messages');
  const query = messagesRef.orderBy('createdAt');

  const [messages] = useCollectionData(query, {idField: 'id'});

  const [formValue, setFormValue] = useState('');

  const sendMessage = async(e) => {
    e.preventDefault();
    const { uid, photoURL } = auth.currentUser;

    await messagesRef.add({
      text: formValue,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      uid,
      photoURL
    })
    setFormValue('');
    dummy.current.scrollIntoView({ behavior: 'auto'});
  }
  const scrollToBottom = () => {
    dummy.current.scrollIntoView({ behavior: "auto" })
  }

  useEffect(scrollToBottom, [messages]);

  return (
    <>
      <main>
        {messages && messages.map(msg => <ChatMessage key={msg.id} message={msg} />)}
        <div ref={dummy}></div>
      </main>

      <form onSubmit={sendMessage}>
        <input value={formValue} onChange={(e) => setFormValue(e.target.value)}/>
        <button type="submit" disabled={!formValue}>Send</button>
      </form>
    </>
  )
}

function ChatMessage(props){
  const { text, uid, photoURL } = props.message;

  const messageClass = uid === auth.currentUser.uid ? 'sent' : 'received';

  return (
    <>
      <div className={`message ${messageClass}`}>
        {/* eslint-disable-next-line */}
        <img src={photoURL}/>
        <p>{text}</p>
      </div>
    </>
  )
}

export default App;
