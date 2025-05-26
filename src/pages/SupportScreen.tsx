import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Linking,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

const faqs: FAQItem[] = [
  {
    id: '1',
    question: 'How do I find food trucks near me?',
    answer: 'Open the app and it will automatically show food trucks in your area. You can also use the search feature to find specific trucks or cuisines.',
  },
  {
    id: '2',
    question: 'How do I update my truck location?',
    answer: 'Go to your truck dashboard and tap "Update Location". You can either use your current GPS location or manually enter an address.',
  },
  {
    id: '3',
    question: 'Can I save my favorite trucks?',
    answer: 'Yes! Tap the heart icon on any truck listing to save it to your favorites. You can view all your favorites from the Favorites tab.',
  },
  {
    id: '4',
    question: 'How do I add or edit my menu?',
    answer: 'From your truck dashboard, go to the Menus section. You can add new menus, edit existing ones, and manage individual menu items.',
  },
  {
    id: '5',
    question: 'What if I forgot my password?',
    answer: 'On the login screen, tap "Forgot Password?" and enter your email. We\'ll send you instructions to reset your password.',
  },
  {
    id: '6',
    question: 'How do customers pay for orders?',
    answer: 'Currently, payments are handled directly between customers and trucks. We\'re working on integrated payment options for future updates.',
  },
];

export default function SupportScreen({ navigation }: any) {
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);
  const [contactForm, setContactForm] = useState({
    subject: '',
    message: '',
  });

  const toggleFAQ = (id: string) => {
    setExpandedFAQ(expandedFAQ === id ? null : id);
  };

  const handleContactSupport = () => {
    if (!contactForm.subject.trim() || !contactForm.message.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    // In a real app, this would send to your backend
    Alert.alert(
      'Message Sent',
      'Thank you for contacting us. We\'ll get back to you within 24 hours.',
      [
        {
          text: 'OK',
          onPress: () => {
            setContactForm({ subject: '', message: '' });
          },
        },
      ]
    );
  };

  const handleEmailSupport = () => {
    Linking.openURL('mailto:support@whatthetruck.com?subject=Support Request');
  };

  const handleCallSupport = () => {
    Linking.openURL('tel:+1234567890');
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back" size={24} color="#333" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Support</Text>
            <View style={{ width: 24 }} />
          </View>

          {/* Quick Contact Options */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Contact Us</Text>
            <View style={styles.contactOptions}>
              <TouchableOpacity style={styles.contactButton} onPress={handleEmailSupport}>
                <Ionicons name="mail" size={24} color="#F28C28" />
                <Text style={styles.contactButtonText}>Email Support</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.contactButton} onPress={handleCallSupport}>
                <Ionicons name="call" size={24} color="#F28C28" />
                <Text style={styles.contactButtonText}>Call Support</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* FAQs */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
            {faqs.map((faq) => (
              <TouchableOpacity
                key={faq.id}
                style={styles.faqItem}
                onPress={() => toggleFAQ(faq.id)}
              >
                <View style={styles.faqHeader}>
                  <Text style={styles.faqQuestion}>{faq.question}</Text>
                  <Ionicons
                    name={expandedFAQ === faq.id ? 'chevron-up' : 'chevron-down'}
                    size={20}
                    color="#666"
                  />
                </View>
                {expandedFAQ === faq.id && (
                  <Text style={styles.faqAnswer}>{faq.answer}</Text>
                )}
              </TouchableOpacity>
            ))}
          </View>

          {/* Contact Form */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Send us a Message</Text>
            <View style={styles.contactForm}>
              <TextInput
                style={styles.input}
                placeholder="Subject"
                value={contactForm.subject}
                onChangeText={(text) =>
                  setContactForm({ ...contactForm, subject: text })
                }
                placeholderTextColor="#999"
              />
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="How can we help you?"
                value={contactForm.message}
                onChangeText={(text) =>
                  setContactForm({ ...contactForm, message: text })
                }
                multiline
                numberOfLines={5}
                textAlignVertical="top"
                placeholderTextColor="#999"
              />
              <TouchableOpacity
                style={styles.submitButton}
                onPress={handleContactSupport}
              >
                <Text style={styles.submitButtonText}>Send Message</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Help Articles */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Help Articles</Text>
            <TouchableOpacity style={styles.articleLink}>
              <Ionicons name="document-text-outline" size={20} color="#F28C28" />
              <Text style={styles.articleLinkText}>Getting Started Guide</Text>
              <Ionicons name="chevron-forward" size={20} color="#666" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.articleLink}>
              <Ionicons name="document-text-outline" size={20} color="#F28C28" />
              <Text style={styles.articleLinkText}>Driver Best Practices</Text>
              <Ionicons name="chevron-forward" size={20} color="#666" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.articleLink}>
              <Ionicons name="document-text-outline" size={20} color="#F28C28" />
              <Text style={styles.articleLinkText}>Safety Guidelines</Text>
              <Ionicons name="chevron-forward" size={20} color="#666" />
            </TouchableOpacity>
          </View>

          {/* App Info */}
          <View style={styles.appInfo}>
            <Text style={styles.appInfoText}>WhatTheTruck v1.0.0</Text>
            <Text style={styles.appInfoText}>© 2024 WhatTheTruck Inc.</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f7f7',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  section: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  contactOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  contactButton: {
    flex: 1,
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 8,
    marginHorizontal: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  contactButtonText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  faqItem: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  faqHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  faqQuestion: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    color: '#333',
    marginRight: 10,
  },
  faqAnswer: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  contactForm: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 14,
    color: '#333',
    backgroundColor: '#f9f9f9',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: '#F28C28',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
    marginTop: 4,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  articleLink: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  articleLinkText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 15,
    color: '#333',
  },
  appInfo: {
    alignItems: 'center',
    paddingVertical: 30,
    marginTop: 20,
  },
  appInfoText: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
});