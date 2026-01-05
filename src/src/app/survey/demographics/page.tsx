'use client';

import { useRouter } from 'next/navigation';
import { SurveyLayout } from '@/components/layout/SurveyLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { useSurveyStore } from '@/stores/surveyStore';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { ChevronRight, User, Car, Music } from 'lucide-react';
import { AGE_GROUPS, GENDERS, PREFECTURES } from '@/types/survey';

const demographicsSchema = z.object({
  ageGroup: z.string().min(1, '年齢を選択してください'),
  gender: z.string().min(1, '性別を選択してください'),
  prefecture: z.string().min(1, 'お住まいの地域を選択してください'),
  drivingExperience: z.number().min(0).max(50),
  evOwnership: z.boolean(),
  audioSensitivity: z.number().min(1).max(5),
});

type DemographicsFormData = z.infer<typeof demographicsSchema>;

export default function DemographicsPage() {
  const router = useRouter();
  const { setDemographics } = useSurveyStore();

  const { control, handleSubmit, watch, formState: { errors, isValid } } = useForm<DemographicsFormData>({
    resolver: zodResolver(demographicsSchema),
    defaultValues: {
      ageGroup: '',
      gender: '',
      prefecture: '',
      drivingExperience: 5,
      evOwnership: false,
      audioSensitivity: 3,
    },
    mode: 'onChange',
  });

  const audioSensitivity = watch('audioSensitivity');
  const drivingExperience = watch('drivingExperience');

  const onSubmit = (data: DemographicsFormData) => {
    setDemographics(data);
    const params = new URLSearchParams(window.location.search);
    const queryString = params.toString();
    const targetUrl = `/survey/audio-check${queryString ? `?${queryString}` : ''}`;
    router.push(targetUrl);
  };

  const sensitivityLabels = [
    '全く気にしない',
    'あまり気にしない',
    'どちらでもない',
    'やや気にする',
    'とても気にする',
  ];

  return (
    <SurveyLayout
      progress={10}
      showBack
      title="あなたについて教えてください"
      subtitle="アンケート結果の分析に使用します"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* 基本属性 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="bg-white shadow-sm">
            <CardContent className="pt-6 space-y-6">
              <div className="flex items-center gap-2 mb-4">
                <User className="w-5 h-5 text-emerald-600" />
                <h2 className="font-semibold text-slate-800">基本情報</h2>
              </div>

              {/* 年齢 */}
              <div className="space-y-3">
                <Label className="text-slate-700" htmlFor="ageGroup">
                  年齢 <span className="text-red-500" aria-label="必須">*</span>
                </Label>
                <Controller
                  name="ageGroup"
                  control={control}
                  render={({ field }) => (
                    <RadioGroup
                      onValueChange={field.onChange}
                      value={field.value}
                      className="grid grid-cols-2 sm:grid-cols-3 gap-2"
                      aria-required="true"
                      aria-invalid={!!errors.ageGroup}
                      aria-describedby={errors.ageGroup ? 'ageGroup-error' : undefined}
                    >
                      {AGE_GROUPS.map((age) => (
                        <div key={age.value}>
                          <RadioGroupItem
                            value={age.value}
                            id={age.value}
                            className="peer sr-only"
                          />
                          <Label
                            htmlFor={age.value}
                            className="flex items-center justify-center px-4 py-3 border rounded-lg cursor-pointer transition-colors peer-data-[state=checked]:bg-emerald-50 peer-data-[state=checked]:border-emerald-500 peer-data-[state=checked]:text-emerald-700 hover:bg-slate-50 focus-within:ring-2 focus-within:ring-emerald-500 focus-within:ring-offset-2"
                          >
                            {age.label}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  )}
                />
                {errors.ageGroup && (
                  <p id="ageGroup-error" className="text-sm text-red-500" role="alert" aria-live="polite">
                    {errors.ageGroup.message}
                  </p>
                )}
              </div>

              {/* 性別 */}
              <div className="space-y-3">
                <Label className="text-slate-700" htmlFor="gender">
                  性別 <span className="text-red-500" aria-label="必須">*</span>
                </Label>
                <Controller
                  name="gender"
                  control={control}
                  render={({ field }) => (
                    <RadioGroup
                      onValueChange={field.onChange}
                      value={field.value}
                      className="grid grid-cols-2 gap-2"
                      aria-required="true"
                      aria-invalid={!!errors.gender}
                      aria-describedby={errors.gender ? 'gender-error' : undefined}
                    >
                      {GENDERS.map((gender) => (
                        <div key={gender.value}>
                          <RadioGroupItem
                            value={gender.value}
                            id={gender.value}
                            className="peer sr-only"
                          />
                          <Label
                            htmlFor={gender.value}
                            className="flex items-center justify-center px-4 py-3 border rounded-lg cursor-pointer transition-colors peer-data-[state=checked]:bg-emerald-50 peer-data-[state=checked]:border-emerald-500 peer-data-[state=checked]:text-emerald-700 hover:bg-slate-50 focus-within:ring-2 focus-within:ring-emerald-500 focus-within:ring-offset-2"
                          >
                            {gender.label}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  )}
                />
                {errors.gender && (
                  <p id="gender-error" className="text-sm text-red-500" role="alert" aria-live="polite">
                    {errors.gender.message}
                  </p>
                )}
              </div>

              {/* 都道府県 */}
              <div className="space-y-3">
                <Label className="text-slate-700" htmlFor="prefecture">
                  お住まいの地域 <span className="text-red-500" aria-label="必須">*</span>
                </Label>
                <Controller
                  name="prefecture"
                  control={control}
                  render={({ field }) => (
                    <div>
                      <Select 
                        onValueChange={field.onChange} 
                        value={field.value}
                      >
                        <SelectTrigger 
                          id="prefecture" 
                          className="w-full"
                          aria-required="true"
                          aria-invalid={!!errors.prefecture}
                          aria-describedby={errors.prefecture ? 'prefecture-error' : undefined}
                        >
                          <SelectValue placeholder="都道府県を選択" />
                        </SelectTrigger>
                        <SelectContent>
                          {PREFECTURES.map((pref) => (
                            <SelectItem key={pref} value={pref}>
                              {pref}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                />
                {errors.prefecture && (
                  <p id="prefecture-error" className="text-sm text-red-500" role="alert" aria-live="polite">
                    {errors.prefecture.message}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* 運転経験 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-white shadow-sm">
            <CardContent className="pt-6 space-y-6">
              <div className="flex items-center gap-2 mb-4">
                <Car className="w-5 h-5 text-emerald-600" />
                <h2 className="font-semibold text-slate-800">運転経験</h2>
              </div>

              {/* 運転歴 */}
              <div className="space-y-4">
                <div className="flex justify-between">
                  <Label className="text-slate-700">運転歴</Label>
                  <span className="text-emerald-600 font-medium">
                    {drivingExperience}年
                  </span>
                </div>
                <Controller
                  name="drivingExperience"
                  control={control}
                  render={({ field }) => (
                    <Slider
                      min={0}
                      max={50}
                      step={1}
                      value={[field.value]}
                      onValueChange={(value) => field.onChange(value[0])}
                      className="py-2"
                    />
                  )}
                />
                <div className="flex justify-between text-xs text-slate-500">
                  <span>0年（免許なし含む）</span>
                  <span>50年以上</span>
                </div>
              </div>

              {/* EV所有 */}
              <div className="flex items-center space-x-3 pt-2">
                <Controller
                  name="evOwnership"
                  control={control}
                  render={({ field }) => (
                    <Checkbox
                      id="evOwnership"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  )}
                />
                <Label htmlFor="evOwnership" className="text-slate-700 cursor-pointer">
                  電気自動車（EV/PHEV）を所有している、または所有したことがある
                </Label>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* 音への感度 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-white shadow-sm">
            <CardContent className="pt-6 space-y-6">
              <div className="flex items-center gap-2 mb-4">
                <Music className="w-5 h-5 text-emerald-600" />
                <h2 className="font-semibold text-slate-800">音への感度</h2>
              </div>

              <div className="space-y-4">
                <Label className="text-slate-700">
                  普段、周囲の音をどのくらい気にしますか？
                </Label>
                <Controller
                  name="audioSensitivity"
                  control={control}
                  render={({ field }) => (
                    <div className="space-y-4">
                      <Slider
                        min={1}
                        max={5}
                        step={1}
                        value={[field.value]}
                        onValueChange={(value) => field.onChange(value[0])}
                        className="py-2"
                      />
                      <div className="text-center">
                        <span className="inline-block px-4 py-2 bg-emerald-50 text-emerald-700 rounded-full text-sm font-medium">
                          {sensitivityLabels[audioSensitivity - 1]}
                        </span>
                      </div>
                      <div className="flex justify-between text-xs text-slate-500">
                        <span>気にしない</span>
                        <span>とても気にする</span>
                      </div>
                    </div>
                  )}
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* 送信ボタン */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="pt-4"
        >
          <Button
            type="submit"
            disabled={!isValid}
            size="lg"
            className="w-full bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white font-medium disabled:opacity-50"
          >
            次へ進む
            <ChevronRight className="w-5 h-5 ml-2" />
          </Button>
        </motion.div>
      </form>
    </SurveyLayout>
  );
}

