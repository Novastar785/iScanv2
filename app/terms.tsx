import { useRouter } from 'expo-router';
import { ArrowLeft, FileText } from 'lucide-react-native';
import React from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { ScrollView, StatusBar, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function TermsScreen() {
  const router = useRouter();
  const { t } = useTranslation();

  return (
    <View className="flex-1 bg-[#0f0f0f]">
      <StatusBar barStyle="light-content" />
      
      <SafeAreaView edges={['top']} className="px-6 pb-4 bg-[#0f0f0f] border-b border-white/5 z-10">
        <View className="flex-row items-center gap-4">
          <TouchableOpacity 
            onPress={() => router.back()} 
            className="w-10 h-10 bg-zinc-900 rounded-full items-center justify-center border border-white/10"
          >
            <ArrowLeft size={20} color="white" />
          </TouchableOpacity>
          <Text className="text-white text-xl font-bold">{t('legal.terms_title')}</Text>
        </View>
      </SafeAreaView>

      <ScrollView className="flex-1 px-6 pt-6" contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        
        <View className="items-center mb-8">
          <View className="w-16 h-16 bg-indigo-500/10 rounded-full items-center justify-center mb-4 border border-indigo-500/20">
            <FileText size={32} color="#818cf8" />
          </View>
          <Text className="text-zinc-400 text-xs uppercase tracking-widest">{t('legal.last_updated')}</Text>
        </View>

        <View className="gap-6">
          <Text className="text-zinc-300 leading-6 text-base">
            <Trans 
              i18nKey="legal.terms.intro" 
              values={{ appName: t('legal.app_name'), companyName: t('legal.company_name') }}
              components={{ bold: <Text className="font-bold text-white" /> }} 
            />
          </Text>

          <Section title={t('legal.terms.section_1_title')}>
            {t('legal.terms.section_1_text')}
            {'\n\n'}
            <Text className="font-bold text-indigo-400">{t('legal.terms.user_representations')}</Text>
            {(t('legal.terms.user_rep_list', { returnObjects: true }) as string[]).map((item, i) => (
              <Text key={i}>{'\n'}• {item}</Text>
            ))}
          </Section>

          <Section title={t('legal.terms.section_2_title')}>
            {t('legal.terms.section_2_text')}
            {'\n\n'}
            <View className="bg-indigo-500/10 p-4 rounded-xl border border-indigo-500/30">
              <Text className="text-white font-bold mb-2">{t('legal.terms.ai_disclaimer_title')}</Text>
              <Text className="text-zinc-300 text-sm">
                {t('legal.terms.ai_disclaimer_text')}
              </Text>
            </View>
          </Section>

          <Section title={t('legal.terms.section_3_title')}>
            {t('legal.terms.section_3_payments')}
            {'\n\n'}
            {t('legal.terms.section_3_subs')}
            {'\n\n'}
            {t('legal.terms.section_3_refunds')}
          </Section>

          <Section title={t('legal.terms.section_4_title')}>
            {t('legal.terms.section_4_text')}
          </Section>

          <Section title={t('legal.terms.section_5_title')}>
            {t('legal.terms.section_5_text')}
          </Section>

          <Section title={t('legal.terms.section_6_title')}>
            {(t('legal.terms.section_6_list', { returnObjects: true }) as string[]).map((item, i) => (
              <Text key={i}>{'\n'}• {item}</Text>
            ))}
          </Section>

          <Section title={t('legal.terms.section_7_title')}>
            {t('legal.terms.section_7_text')}
          </Section>

          <Section title={t('legal.terms.section_8_title')}>
            {t('legal.terms.section_8_text')}
          </Section>

          <Section title={t('legal.terms.section_9_title')}>
            {t('legal.terms.section_9_text')}
          </Section>

          <Section title={t('legal.terms.section_10_title')}>
            {t('legal.terms.section_10_text')}
          </Section>

          <Section title={t('legal.terms.section_11_title')}>
            {t('legal.terms.section_11_text')}
          </Section>

          <Section title={t('legal.terms.section_12_title')}>
            {t('legal.terms.section_12_text')}
          </Section>

          <Section title={t('legal.terms.section_13_title')}>
            {t('legal.terms.section_13_text')}
          </Section>

          <Section title={t('legal.terms.section_14_title')}>
            {t('legal.terms.section_14_text')}
          </Section>

          <Section title={t('legal.terms.section_15_title')}>
            {t('legal.terms.section_15_text')}
          </Section>

          <Section title={t('legal.terms.section_16_title')}>
            {t('legal.terms.section_16_text')}
          </Section>

          <Section title={t('legal.terms.section_17_title')}>
            {t('legal.terms.section_17_text')}
          </Section>

          <Section title={t('legal.terms.section_18_title')}>
            <Text className="font-bold text-white">Email:</Text> {t('legal.contact_email')}
            {'\n'}<Text className="font-bold text-white">Company:</Text> {t('legal.company_name')}
          </Section>

        </View>

        <View className="h-20" />
      </ScrollView>
    </View>
  );
}

function Section({ title, children }: { title: string, children: React.ReactNode }) {
  return (
    <View>
      <Text className="text-white text-lg font-bold mb-2">{title}</Text>
      <Text className="text-zinc-400 leading-6 text-base">{children}</Text>
    </View>
  );
}