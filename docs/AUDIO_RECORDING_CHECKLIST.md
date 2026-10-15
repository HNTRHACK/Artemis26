# Audio recording checklist

Generated from `src/lib/audio-guides.ts` by `npm run audio:checklist`. Edit the manifest, not this file.

## How to deliver recordings

1. Record each clip below in each language (27 clips in total). Speak slowly and warmly; 20–40 seconds each.
2. Export as **MP3, mono, 64–128 kbps** (44.1 or 48 kHz). Trim silence at the start and end.
3. Save with the **exact file name** shown, into `public/audio/en/`, `public/audio/hi/` or `public/audio/mr/`.
4. Run `npm run audio:check` to confirm. No code changes are needed — the Listen buttons switch from
   “Recorded audio coming soon” to the real player automatically.
5. Commit the files. If you redeploy, the new clips are live.

Until a clip exists, the app offers an optional **device voice** (clearly labelled as computer-generated) that reads the same script.

## Where each clip plays

| File | Screen |
| --- | --- |
| `welcome.mp3` | One-tap access (`/choose-role`) |
| `onboarding.mp3` | Worker onboarding, step 1 |
| `find-work.mp3` | Find work (`/worker/jobs`), FAQ “How do I find work?” |
| `job-details.mp3` | Job detail, FAQ “How do I apply?” |
| `payment-terms.mp3` | Pay box on job detail, FAQ “How do I check my wages?” |
| `offer-accepted.mp3` | Offer panel (accept / decline) |
| `ticket-help.mp3` | Job ticket, FAQ “What happens after I accept an offer?” |
| `rights.mp3` | Rights & welfare page |
| `faq-help.mp3` | FAQ page header |

## Clips and scripts

### Welcome to UMANG — `welcome.mp3`

- [ ] **English** → `public/audio/en/welcome.mp3`

  > Welcome to UMANG. If you are looking for work, tap “I want work”. If you want to hire workers, tap “I want to hire”. You do not need a password. You can change the language at the top of the screen.

- [ ] **Hindi (हिन्दी)** → `public/audio/hi/welcome.mp3`

  > UMANG में आपका स्वागत है। अगर आपको काम चाहिए, तो “मुझे काम चाहिए” दबाएँ। अगर आपको कामगार चाहिए, तो “मुझे कामगार चाहिए” दबाएँ। पासवर्ड की ज़रूरत नहीं है। स्क्रीन के ऊपर आप भाषा बदल सकते हैं।

- [ ] **Marathi (मराठी)** → `public/audio/mr/welcome.mp3`

  > UMANG मध्ये आपले स्वागत आहे. तुम्हाला काम हवे असेल तर “मला काम हवे” दाबा. तुम्हाला कामगार हवे असतील तर “मला कामगार हवेत” दाबा. पासवर्डची गरज नाही. स्क्रीनच्या वर तुम्ही भाषा बदलू शकता.

### Setting up your profile — `onboarding.mp3`

- [ ] **English** → `public/audio/en/onboarding.mp3`

  > We will ask you five short questions: your language, the work you do, where you live, your years of experience, and your name and phone number. Tap one answer on each screen, then tap Continue. Your number is shared with an employer only if you accept their offer.

- [ ] **Hindi (हिन्दी)** → `public/audio/hi/onboarding.mp3`

  > हम आपसे पाँच छोटे सवाल पूछेंगे: आपकी भाषा, आप कौन-सा काम करते हैं, आप कहाँ रहते हैं, कितने साल का अनुभव है, और आपका नाम व फ़ोन नंबर। हर स्क्रीन पर एक जवाब दबाएँ, फिर आगे बढ़ें दबाएँ। आपका नंबर किसी नियोक्ता को तभी मिलेगा जब आप उनका ऑफ़र स्वीकार करेंगे।

- [ ] **Marathi (मराठी)** → `public/audio/mr/onboarding.mp3`

  > आम्ही तुम्हाला पाच छोटे प्रश्न विचारू: तुमची भाषा, तुम्ही कोणते काम करता, तुम्ही कुठे राहता, किती वर्षांचा अनुभव आहे, आणि तुमचे नाव व फोन नंबर. प्रत्येक स्क्रीनवर एक उत्तर दाबा, मग पुढे चला दाबा. तुम्ही मालकाची ऑफर स्वीकारली तरच तुमचा नंबर त्यांना मिळेल.

### Finding work near you — `find-work.mp3`

- [ ] **English** → `public/audio/en/find-work.mp3`

  > These are jobs near you, closest first. Each card shows the work, the pay, and how far it is. Tap the buttons at the top to see only your kind of work. Tap a job to read everything about it.

- [ ] **Hindi (हिन्दी)** → `public/audio/hi/find-work.mp3`

  > ये आपके पास के काम हैं, सबसे पास वाले पहले। हर कार्ड पर काम, मज़दूरी और दूरी दिखती है। सिर्फ़ अपनी तरह का काम देखने के लिए ऊपर के बटन दबाएँ। पूरी जानकारी पढ़ने के लिए किसी काम पर दबाएँ।

- [ ] **Marathi (मराठी)** → `public/audio/mr/find-work.mp3`

  > ही तुमच्या जवळची कामे आहेत, सर्वात जवळची आधी. प्रत्येक कार्डवर काम, मजुरी आणि अंतर दिसते. फक्त तुमच्या प्रकारचे काम पाहण्यासाठी वरची बटणे दाबा. पूर्ण माहिती वाचण्यासाठी एखाद्या कामावर दाबा.

### Understanding a job — `job-details.mp3`

- [ ] **English** → `public/audio/en/job-details.mp3`

  > This page shows everything about one job: the pay, how long it lasts, the working hours, the place and what the employer provides. If you want this job, tap “I’m interested”. The employer will see your skill card. Never pay money to get a job.

- [ ] **Hindi (हिन्दी)** → `public/audio/hi/job-details.mp3`

  > इस पेज पर एक काम की पूरी जानकारी है: मज़दूरी, काम कितने दिन चलेगा, काम का समय, जगह और नियोक्ता क्या देंगे। अगर आपको यह काम चाहिए, तो “मुझे यह काम चाहिए” दबाएँ। नियोक्ता आपका स्किल कार्ड देखेंगे। काम पाने के लिए कभी पैसे न दें।

- [ ] **Marathi (मराठी)** → `public/audio/mr/job-details.mp3`

  > या पानावर एका कामाची पूर्ण माहिती आहे: मजुरी, काम किती दिवस चालेल, कामाची वेळ, ठिकाण आणि मालक काय देतील. तुम्हाला हे काम हवे असेल तर “मला हे काम हवे” दाबा. मालक तुमचे कौशल्य कार्ड पाहतील. काम मिळवण्यासाठी कधीही पैसे देऊ नका.

### Pay and payment timing — `payment-terms.mp3`

- [ ] **English** → `public/audio/en/payment-terms.mp3`

  > The big number is your pay. Next to it you see if it is per day, per month, or for the whole job. “Payment” tells you when you get paid — daily, weekly, monthly or when the work is finished. “Paid by” tells you how — cash, UPI or bank. Check these before you say yes.

- [ ] **Hindi (हिन्दी)** → `public/audio/hi/payment-terms.mp3`

  > बड़ा अंक आपकी मज़दूरी है। उसके पास लिखा है कि यह प्रति दिन, प्रति माह या पूरे काम की है। “भुगतान” बताता है कि पैसा कब मिलेगा — रोज़, हफ़्ते में, महीने में या काम पूरा होने पर। “भुगतान का तरीका” बताता है कैसे — नकद, UPI या बैंक। हाँ कहने से पहले इन्हें जाँच लें।

- [ ] **Marathi (मराठी)** → `public/audio/mr/payment-terms.mp3`

  > मोठा आकडा म्हणजे तुमची मजुरी. त्याच्याशेजारी ती दररोज, दरमहा की संपूर्ण कामाची आहे ते लिहिले आहे. “पैसे” सांगते पैसे कधी मिळतील — रोज, आठवड्याला, महिन्याला की काम पूर्ण झाल्यावर. “पैसे देण्याची पद्धत” सांगते कसे — रोख, UPI की बँक. हो म्हणण्यापूर्वी हे तपासा.

### Accepting or declining an offer — `offer-accepted.mp3`

- [ ] **English** → `public/audio/en/offer-accepted.mp3`

  > An employer has offered you a job. Read the pay, start date, hours, place and instructions. If you agree, tick the box to share your phone number and tap “Accept offer”. You will get a job ticket. If you do not want it, tap “Decline offer”. Saying no is okay.

- [ ] **Hindi (हिन्दी)** → `public/audio/hi/offer-accepted.mp3`

  > एक नियोक्ता ने आपको काम ऑफ़र किया है। मज़दूरी, शुरू की तारीख़, समय, जगह और निर्देश पढ़ें। अगर आप सहमत हैं, तो फ़ोन नंबर साझा करने वाले बॉक्स पर टिक करें और “ऑफ़र स्वीकार करें” दबाएँ। आपको जॉब टिकट मिलेगा। अगर नहीं चाहिए, तो “ऑफ़र मना करें” दबाएँ। मना करना ठीक है।

- [ ] **Marathi (मराठी)** → `public/audio/mr/offer-accepted.mp3`

  > एका मालकांनी तुम्हाला काम देऊ केले आहे. मजुरी, सुरुवातीची तारीख, वेळ, ठिकाण आणि सूचना वाचा. तुम्ही तयार असाल तर फोन नंबर शेअर करण्याच्या बॉक्सवर खूण करा आणि “ऑफर स्वीकारा” दाबा. तुम्हाला जॉब तिकीट मिळेल. नको असेल तर “ऑफर नाकारा” दाबा. नाही म्हणणे ठीक आहे.

### Your job ticket — `ticket-help.mp3`

- [ ] **English** → `public/audio/en/ticket-help.mp3`

  > This is your job ticket. It shows the pay, dates, place and instructions you and the employer agreed. Keep it safe and show it if there is any confusion. You can call, send an SMS or chat on WhatsApp from here. The ticket is not proof of payment.

- [ ] **Hindi (हिन्दी)** → `public/audio/hi/ticket-help.mp3`

  > यह आपका जॉब टिकट है। इसमें वह मज़दूरी, तारीख़, जगह और निर्देश हैं जिन पर आप और नियोक्ता सहमत हुए। इसे संभाल कर रखें और कोई उलझन हो तो दिखाएँ। यहाँ से आप कॉल, SMS या WhatsApp कर सकते हैं। टिकट भुगतान का सबूत नहीं है।

- [ ] **Marathi (मराठी)** → `public/audio/mr/ticket-help.mp3`

  > हे तुमचे जॉब तिकीट आहे. यात तुम्ही आणि मालकांनी ठरवलेली मजुरी, तारखा, ठिकाण आणि सूचना आहेत. ते जपून ठेवा आणि गोंधळ झाल्यास दाखवा. इथून तुम्ही कॉल, SMS किंवा WhatsApp करू शकता. तिकीट हा पैसे दिल्याचा पुरावा नाही.

### Your rights at work — `rights.mp3`

- [ ] **English** → `public/audio/en/rights.mp3`

  > Every worker has rights. You must get at least the minimum wage, and you must be paid on time. Women and men doing the same work get the same pay. Ask for safety gear. Never pay money to get a job. For help, call 112 in an emergency.

- [ ] **Hindi (हिन्दी)** → `public/audio/hi/rights.mp3`

  > हर कामगार के अधिकार हैं। आपको कम से कम न्यूनतम मज़दूरी मिलनी चाहिए, और समय पर मिलनी चाहिए। एक ही काम करने वाली महिलाओं और पुरुषों को बराबर पैसा मिलता है। सुरक्षा उपकरण माँगें। काम पाने के लिए कभी पैसे न दें। आपातकाल में 112 पर कॉल करें।

- [ ] **Marathi (मराठी)** → `public/audio/mr/rights.mp3`

  > प्रत्येक कामगाराला हक्क आहेत. तुम्हाला किमान वेतन तरी मिळायलाच हवे, आणि ते वेळेवर मिळायला हवे. एकच काम करणाऱ्या स्त्रिया व पुरुषांना समान पैसे मिळतात. सुरक्षा साधने मागा. काम मिळवण्यासाठी कधीही पैसे देऊ नका. आपत्कालीन परिस्थितीत 112 वर कॉल करा.

### Using the help page — `faq-help.mp3`

- [ ] **English** → `public/audio/en/faq-help.mp3`

  > Here you find answers to common questions. Tap a topic, or type a word in the search box. Tap a question to open the answer. Many answers have a listen button.

- [ ] **Hindi (हिन्दी)** → `public/audio/hi/faq-help.mp3`

  > यहाँ आम सवालों के जवाब हैं। कोई विषय दबाएँ, या खोज बॉक्स में कोई शब्द लिखें। जवाब खोलने के लिए सवाल दबाएँ। कई जवाबों में सुनने का बटन है।

- [ ] **Marathi (मराठी)** → `public/audio/mr/faq-help.mp3`

  > इथे नेहमीच्या प्रश्नांची उत्तरे आहेत. एखादा विषय दाबा, किंवा शोध बॉक्समध्ये शब्द लिहा. उत्तर उघडण्यासाठी प्रश्न दाबा. अनेक उत्तरांमध्ये ऐकण्याचे बटण आहे.
