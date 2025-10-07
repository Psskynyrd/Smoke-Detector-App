// import React, { useEffect, useRef, useState } from 'react';
// import { View, Text, TextInput, Button } from 'react-native';
// import 'react-native-get-random-values';
// import { Client } from '@taoqf/react-native-mqtt';
// // import mqtt from 

// export default function App() {
//   const clientRef = useRef(null);
//   const [incoming, setIncoming] = useState('');
//   const [text, setText] = useState('');

//   useEffect(() => {
//     // Create new MQTT client instance
//     // const client = new Client( {
//     //   host: '38.0.101.76',
//     //   port: 1883,
//     //   clientId: 'esp32',
//     // }, {
//     //   username: 'esp32',
//     //   password: 'esp32',
//     // });
//     const client = new Client()

//     client.on('connect', () => {
//       console.log('MQTT connected');
//       // Subscribe to responses from ESP
//       client.subscribe('esp32/resp').then(() => {
//         console.log('Subscribed esp32/resp');
//       }).catch(err => console.warn('subscribe error', err));
//     });

//     client.on('connectionLost', (err) => {
//       console.warn('Connection lost', err);
//     });

//     client.on('message', (topic, payload) => {
//       // payload is a Uint8Array or Buffer; convert to string
//       const s = typeof payload === 'string' ? payload : Buffer.from(payload).toString();
//       console.log('Message arrived', topic, s);
//       setIncoming(s);
//     });

//     client.connect().catch(err => console.error('MQTT connect error', err));
//     clientRef.current = client;

//     return () => {
//       if (clientRef.current) clientRef.current.disconnect();
//     };
//   }, []);

//   const send = async () => {
//     if (!clientRef.current) return;
//     try {
//       const msg = new Message(text);
//       msg.destinationName = 'esp32/cmd';
//       await clientRef.current.send(msg);
//       console.log('Sent:', text);
//     } catch (err) {
//       console.error('Send error', err);
//     }
//   };

//   return (
//     <View style={{ padding: 20 }}>
//       <Text>Publish to esp32/cmd (RN → ESP)</Text>
//       <TextInput
//         placeholder="command"
//         value={text}
//         onChangeText={setText}
//         style={{ borderWidth: 1, marginVertical: 12, padding: 8 }}
//       />
//       <Button title="Send to ESP" onPress={send} />
//       <Text style={{ marginTop: 20 }}>Last message from ESP (esp32/resp):</Text>
//       <Text>{incoming}</Text>
//     </View>
//   );
// }
