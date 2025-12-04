import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';

export default function WelcomeScreen({ navigation }) { // <-- Adicione navigation aqui
  return (
    <View style={styles.container}>
      {/* Logo */}
      <View style={styles.logoContainer}>
        <Image
            source={require('../assets/alertaconecta-logo.png')}
            style={styles.logo}
        />
      </View>

      {/* Mensagem de boas-vindas */}
      <View style={styles.welcomeContainer}>
        <Text style={styles.welcomeTitle}>Bem-vindo(a)!</Text>
        <Text style={styles.welcomeSubtitle}>Conecte-se com uma conta</Text>
      </View>

      {/* Botão de login */}
      <TouchableOpacity
        style={styles.loginButton}
        onPress={() => navigation.navigate('Login')} // <-- Adicione esta linha
      >
        <Text style={styles.loginButtonText}>Fazer login</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 70,
  },
  logo: {
    width: 117,
    height: 171,
    marginBottom: 10,
  },
  
  welcomeContainer: {
    alignItems: 'flex-start',
    width: '80%',
    marginBottom: 30,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#003366',
    marginBottom: 5,
  },
  welcomeSubtitle: {
    fontSize: 20,
    color: '#222',
  },
  loginButton: {
    backgroundColor: '#D31C30',
    paddingVertical: 15,
    paddingHorizontal: 110,
    borderRadius: 50,
    marginTop: 10,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'medium',
  },
});