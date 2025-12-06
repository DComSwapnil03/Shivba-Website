import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      /* ========= NAV ========= */
      nav: {
        home: 'Home',
        about: 'About',
        services: 'Services',
        events: 'Events',
        gallery: 'Gallery',
        faq: 'FAQ',
        help: 'Help', // Added for nav consistency
        contact: 'Contact',
        myAccount: 'My Account',
        register: 'Register'
      },

      /* ========= HERO TICKER ========= */
      hero: {
        latestUpdates: 'LATEST UPDATES',
        tickerText:
          'Admissions open for Shivba Talim · Library memberships available · Limited hostel seats · Join our upcoming workshops and cultural events ·'
      },

      /* ========= HOME ========= */
      home: {
        heroTitle: 'Welcome to Shivba Community Center',
        heroSubtitle:
          'Fitness, knowledge, and community – all in one place. Join Shivba Talim, Hostel, Library, and social initiatives to transform your daily life.',
        heroPrimary: 'Register Interest',
        heroSecondary: 'Contact Team',
        visitButton: 'Visit Shivba',
        stats: {
          membersNumber: '2000+',
          membersLabel: 'Active Members',
          workshopsNumber: '500+',
          workshopsLabel: 'Workshops Held',
          yearsNumber: '15',
          yearsLabel: 'Years of Service'
        },
        slides: [
          {
            title: 'Fitness. Focus. Community.',
            text: 'Train at Shivba Talim with modern equipment and supportive coaches.',
            image: '/gym.jpg'
          },
          {
            title: 'Study in Peace.',
            text: 'Prepare for exams at Shivba Library with quiet, focused spaces.',
            image: '/Library.jpg'
          },
          {
            title: 'Stay & Grow Together.',
            text: 'Live comfortably at Shivba Hostel near your college and coaching.',
            image: '/hostel.jpg'
          }
        ],
        slideCounter: 'Slide {{current}} / {{total}}',
        servicesTitle: 'What You Get at Shivba',
        servicesSubtitle:
          'Four pillars that support your physical, intellectual, and social growth.',
        cards: {
          talim: {
            title: 'Shivba Talim (Gym)',
            text:
              'Modern equipment, coaching, and group workouts to build strength and stamina.'
          },
          hostel: {
            title: 'Shivba Hostel',
            text:
              'Safe, comfortable accommodation for students and working professionals.'
          },
          library: {
            title: 'Shivba Library',
            text:
              'Quiet spaces, rich collection of books, and a focused study environment.'
          },
          social: {
            title: 'Social Programs',
            text:
              'Awareness events, guest lectures, and cultural programs for the community.'
          }
        },
        ctaTitle: 'Ready to visit Shivba?',
        ctaSubtitle:
          'Come to Jadhav Commercial Centre, Chakan, or send us your details and we will guide you through membership options.',
        ctaPrimary: 'Register Now',
        ctaSecondary: 'Get Directions'
      },

      /* ========= ABOUT ========= */
      about: {
        heroTitle: 'About Shivba',
        heroSubtitle: 'Strengthening bodies, minds, and communities since 2010.',
        storyTitle: 'Our Story',
        storyParagraph1:
          'Founded in 2010, Shivba began as a small community initiative aimed at promoting fitness and wellness. What started with a modest gym and a handful of members has grown into a comprehensive community center.',
        storyParagraph2:
          'Today, Shivba offers not only physical fitness at Shivba Talim, but also intellectual growth through our library, comfortable accommodation at Shivba Hostel, and social awareness programs that bring the community together.',
        drivesTitle: 'What Drives Us',
        missionTitle: 'Our Mission',
        missionText:
          'To empower individuals through holistic development, fostering physical fitness, intellectual growth, and social connections.',
        visionTitle: 'Our Vision',
        visionText:
          'To be the leading community center that transforms lives through excellence in fitness, education, and cultural enrichment.',
        valuesTitle: 'Our Values',
        valuesText:
          'Integrity, inclusivity, excellence, and community service guide every decision we make at Shivba.',
        commitmentTitle: 'Our Commitment',
        commitmentText:
          'We are dedicated to providing safe spaces, modern facilities, and supportive programs for every member.',
        teamTitle: 'Our Leadership Team',
        team1: { name: 'Aniket Thakur', role: 'Founder & Director' },
        team2: { name: 'Harshada Thakur', role: 'Operations Manager' },
        team3: { name: 'Swapnil Lokare', role: 'Programs Coordinator' }
      },

      /* ========= FAQ ========= */
      faq: {
        heroTitle: 'Frequently Asked Questions',
        heroSubtitle:
          'Find answers to common questions about our services and facilities.',
        searchPlaceholder: 'Search FAQs (membership, hostel, payments...)',
        noResults: 'No FAQs found for that search.',
        chatTitle: 'Ask Shivba Assistant',
        chatSubtitle:
          'Type your question and we will suggest an answer from our FAQs, just like a service center assistant.',
        chatPlaceholder: 'Example: What are your gym timings?',
        chatButton: 'Get Answer',
        chatLabel: 'Assistant:',
        chatMatch:
          'Here is what we usually say about "{{question}}": {{answer}}',
        chatNoMatch:
          'This question needs a human to review. Please use the Email Us button below or the Contact page, and our team will reply shortly.',
        ctaTitle: 'Still Have Questions?',
        ctaSubtitle: 'Our team is here to help you with any inquiries.',
        ctaButton: 'Email Us',
        items: [
          {
            id: 1,
            category: 'Membership',
            question: 'How do I join Shivba Talim?',
            answer:
              'You can visit our center during working hours or use the Register button on this website. Our team will help you choose a suitable membership plan.'
          },
          {
            id: 2,
            category: 'Membership',
            question: 'Do you offer trial sessions?',
            answer:
              'Yes, we occasionally run free trial days and intro sessions. Check the Events page or contact us for current offers.'
          },
          {
            id: 3,
            category: 'Hostel',
            question: 'Is hostel accommodation available for students?',
            answer:
              'Yes. Shivba Hostel offers shared and limited single rooms for students and working professionals, subject to availability.'
          },
          {
            id: 4,
            category: 'Payments',
            question: 'Which payment methods are accepted?',
            answer:
              'We accept UPI, major debit/credit cards, net banking, and cash payments at the front desk.'
          },
          {
            id: 5,
            category: 'Timings',
            question: 'What are the gym timings?',
            answer:
              'The gym is generally open from early morning to late evening with separate batches. Exact timings may vary on Sundays and public holidays.'
          }
        ]
      },

      /* ========= HELP PAGE (New) ========= */
      help: {
        hero: {
          title: 'Help & Guide',
          subtitle: 'Discover what Shivba offers and navigate like a pro.'
        },
        sections: {
          features: 'What You Can Do Here',
          shortcuts: 'Keyboard Shortcuts'
        },
        labels: {
          proTip: 'Pro Tip'
        },
        features: {
          talim: {
            title: 'Shivba Talim',
            desc: 'Join our traditional and modern fitness programs designed for holistic strength.'
          },
          hostel: {
            title: 'Hostel Facilities',
            desc: 'Secure and affordable accommodation for students and working professionals.'
          },
          library: {
            title: 'Library & Study',
            desc: 'A quiet, resource-rich environment dedicated to academic growth.'
          },
          social: {
            title: 'Social Awareness',
            desc: 'Participate in community workshops and social drives.'
          },
          events: {
            title: 'Event Management',
            desc: 'Browse and register for upcoming cultural and educational events instantly.'
          },
          member: {
            title: 'Member Portal',
            desc: 'Track your subscriptions and verify your membership status online.'
          }
        },
        shortcuts: {
          home: 'Home Page',
          about: 'About Us',
          services: 'Services',
          events: 'Events',
          gallery: 'Gallery',
          contact: 'Contact',
          register: 'Register',
          account: 'My Account',
          back: 'Go Back',
          forward: 'Go Forward',
          quickAccess: 'Quick Service Access (on Services Page)'
        },
        accessibility: {
          title: 'Accessibility Options',
          desc_pre: 'Use the floating settings button in the bottom right corner to toggle',
          darkMode: 'Dark Mode',
          desc_post: 'for easier reading at night, or jump to the top of the page instantly.'
        }
      }
    }
  },

  mr: {
    translation: {
      nav: {
        home: 'मुख्यपृष्ठ',
        about: 'आमच्याबद्दल',
        services: 'सेवा',
        events: 'कार्यक्रम',
        gallery: 'गॅलरी',
        faq: 'प्रश्नोत्तर',
        help: 'मदत',
        contact: 'संपर्क',
        myAccount: 'माय अकाउंट',
        register: 'नोंदणी'
      },

      hero: {
        latestUpdates: 'ताज्या घडामोडी',
        tickerText:
          'शिवबा तालिम प्रवेश सुरू · ग्रंथालय सदस्यता उपलब्ध · मर्यादित हॉस्टेल जागा · आमच्या कार्यशाळा आणि सांस्कृतिक कार्यक्रमात सहभागी व्हा ·'
      },

      home: {
        heroTitle: 'शिवबा कम्युनिटी सेंटरमध्ये आपले स्वागत आहे',
        heroSubtitle:
          'फिटनेस, ज्ञान आणि समुदाय – हे सर्व एकाच ठिकाणी. शिवबा तालिम, हॉस्टेल, लायब्ररी आणि सामाजिक उपक्रमांमधून तुमचे दैनंदिन जीवन बदला.',
        heroPrimary: 'रजिस्ट्रेशनसाठी रस दाखवा',
        heroSecondary: 'टीमशी संपर्क करा',
        visitButton: 'शिवबा भेट द्या',
        stats: {
          membersNumber: '2000+',
          membersLabel: 'सक्रिय सभासद',
          workshopsNumber: '500+',
          workshopsLabel: 'घेतलेले वर्कशॉप',
          yearsNumber: '15',
          yearsLabel: 'सेवेची वर्षे'
        },
        slides: [
          {
            title: 'फिटनेस. फोकस. कम्युनिटी.',
            text:
              'आधुनिक साधने आणि सहकार्य करणारे ट्रेनर्स यांसह शिवबा तालिममध्ये ट्रेनिंग घ्या.',
            image: '/gym.jpg'
          },
          {
            title: 'शांततेत अभ्यास करा.',
            text:
              'शिवबा लायब्ररीमध्ये शांत वातावरणात एकाग्रतेने परीक्षेची तयारी करा.',
            image: '/Library.jpg'
          },
          {
            title: 'राहा आणि सोबत प्रगती करा.',
            text:
              'कॉलेज आणि कोचिंगजवळील शिवबा हॉस्टेलमध्ये आरामदायी राहणीमानाचा अनुभव घ्या.',
            image: '/hostel.jpg'
          }
        ],
        slideCounter: 'स्लाइड {{current}} / {{total}}',
        servicesTitle: 'शिवबामध्ये तुम्हाला काय मिळते',
        servicesSubtitle:
          'तुमच्या शारीरिक, बौद्धिक आणि सामाजिक वाढीस आधार देणारे चार स्तंभ.',
        cards: {
          talim: {
            title: 'शिवबा तालिम (जिम)',
            text:
              'शक्ती आणि स्टॅमिना वाढवण्यासाठी आधुनिक साधने, कोचिंग आणि ग्रुप वर्कआउट्स.'
          },
          hostel: {
            title: 'शिवबा हॉस्टेल',
            text:
              'विद्यार्थी आणि काम करणाऱ्यांसाठी सुरक्षित, आरामदायी निवास व्यवस्था.'
          },
          library: {
            title: 'शिवबा लायब्ररी',
            text:
              'शांत जागा, समृद्ध पुस्तकसंग्रह आणि एकाग्र अभ्यासाचे वातावरण.'
          },
          social: {
            title: 'सामाजिक उपक्रम',
            text:
              'जागरूकता कार्यक्रम, अतिथी व्याख्याने आणि समुदायासाठी सांस्कृतिक कार्यक्रम.'
          }
        },
        ctaTitle: 'शिवबा भेट देण्यासाठी तयार आहात?',
        ctaSubtitle:
          'जाधव कमर्शियल सेंटर, चाकण येथे प्रत्यक्ष या किंवा तुमची माहिती पाठवा, आम्ही योग्य मेंबरशिप पर्याय समजावून सांगू.',
        ctaPrimary: 'आता नोंदणी करा',
        ctaSecondary: 'मार्गदर्शन मिळवा'
      },

      about: {
        heroTitle: 'शिवबा विषयी',
        heroSubtitle: '२०१० पासून शरीर, मन आणि समाज घडवण्याचे कार्य.',
        storyTitle: 'आमची वाटचाल',
        storyParagraph1:
          '२०१० मध्ये सुरू झालेली शिवबा ही सुरुवातीला अल्प सदस्यांसह फिटनेस आणि आरोग्य वाढवण्याची छोटी मोहीम होती. कालांतराने ती सर्वांगीण विकासावर लक्ष देणारे समुदाय केंद्र बनली.',
        storyParagraph2:
          'आज शिवबा तालिमद्वारे शारीरिक तंदुरुस्ती, वाचनालयाद्वारे बौद्धिक विकास, शिवबा हॉस्टेलमधील निवास व्यवस्था आणि विविध सामाजिक उपक्रमांद्वारे समाजजागृती घडवते.',
        drivesTitle: 'आम्हाला प्रेरणा देणारे मूल्य',
        missionTitle: 'आमचे ध्येय',
        missionText:
          'शारीरिक, बौद्धिक आणि सामाजिक प्रगती घडवून प्रत्येक व्यक्तीला सर्वांगीण विकासाची ताकद देणे.',
        visionTitle: 'आमची दृष्टी',
        visionText:
          'फिटनेस, शिक्षण आणि सांस्कृतिक उपक्रमांतून लोकांचे जीवन बदलणारे अग्रगण्य समुदाय केंद्र म्हणून ओळख मिळवणे.',
        valuesTitle: 'आमची मूल्ये',
        valuesText:
          'प्रामाणिकपणा, सर्वसमावेशकता, उत्कृष्टता आणि समाजसेवा ही प्रत्येक निर्णयामागची आधारस्तंभ आहेत.',
        commitmentTitle: 'आमची बांधिलकी',
        commitmentText:
          'प्रत्येक सभासदासाठी सुरक्षित जागा, आधुनिक सुविधा आणि सहायक कार्यक्रम उपलब्ध करून देण्याचे आम्ही वचन देतो.',
        teamTitle: 'आमची नेतृत्व टीम',
        team1: { name: 'अनिकेत ठाकूर', role: 'संस्थापक व संचालक' },
        team2: { name: 'हर्षदा ठाकूर', role: 'ऑपरेशन्स मॅनेजर' },
        team3: { name: 'स्वप्निल लोकरे', role: 'कार्यक्रम समन्वयक' }
      },

      faq: {
        heroTitle: 'नेहमी विचारले जाणारे प्रश्न',
        heroSubtitle:
          'आमच्या सेवा आणि सुविधांबद्दल सर्वसाधारण प्रश्नांची उत्तरे येथे मिळतील.',
        searchPlaceholder: 'शोधा (मेंबरशिप, हॉस्टेल, पेमेंट्स...)',
        noResults: 'तुमच्या शोधासाठी कोणतेही प्रश्न सापडले नाहीत.',
        chatTitle: 'शिवबा सहाय्यकाला विचारा',
        chatSubtitle:
          'तुमचा प्रश्न लिहा आणि आमच्या FAQ मधून आम्ही योग्य उत्तर सुचवू.',
        chatPlaceholder: 'उदा.: जिमचे वेळापत्रक काय आहे?',
        chatButton: 'उत्तर मिळवा',
        chatLabel: 'सहाय्यक:',
        chatMatch:
          '“{{question}}” या प्रश्नाबाबत आम्ही साधारणपणे असे सांगतो: {{answer}}',
        chatNoMatch:
          'या प्रश्नासाठी मानवी तपासाची गरज आहे. कृपया खालील “Email Us” बटण वापरा किंवा संपर्क पृष्ठावरून आमच्याशी बोला.',
        ctaTitle: 'अजूनही प्रश्न आहेत?',
        ctaSubtitle: 'कोणत्याही शंकेसाठी आमची टीम मदतीसाठी सज्ज आहे.',
        ctaButton: 'ईमेल करा',
        items: [
          {
            id: 1,
            category: 'मेंबरशिप',
            question: 'शिवबा तालिममध्ये सदस्य कसे व्हायचे?',
            answer:
              'कामाच्या वेळेत आमच्या सेंटरला भेट द्या किंवा या वेबसाइटवरील “Register” बटण वापरा. आमची टीम तुम्हाला योग्य मेंबरशिप योजना निवडण्यात मदत करेल.'
          },
          {
            id: 2,
            category: 'मेंबरशिप',
            question: 'ट्रायल सेशनची सुविधा आहे का?',
            answer:
              'होय, आम्ही काही वेळा मोफत ट्रायल डे आणि ओळखपर सेशन आयोजित करतो. चालू ऑफरसाठी इव्हेंट्स पेज पहा किंवा आमच्याशी संपर्क साधा.'
          },
          {
            id: 3,
            category: 'हॉस्टेल',
            question: 'विद्यार्थ्यांसाठी हॉस्टेलची सोय आहे का?',
            answer:
              'होय. शिवबा हॉस्टेलमध्ये विद्यार्थ्यांसाठी आणि काम करणाऱ्यांसाठी शेअर्ड तसेच मर्यादित सिंगल रूम्स उपलब्ध असतात (उपलब्धतानुसार).'
          },
          {
            id: 4,
            category: 'पेमेंट',
            question: 'कोणते पेमेंट पर्याय उपलब्ध आहेत?',
            answer:
              'आम्ही UPI, प्रमुख डेबिट/क्रेडिट कार्ड्स, नेट बँकिंग आणि रिसेप्शनवर रोख पेमेंट स्वीकारतो.'
          },
          {
            id: 5,
            category: 'वेळापत्रक',
            question: 'जिमचे वेळापत्रक काय आहे?',
            answer:
              'जिम साधारणपणे सकाळी लवकर ते रात्री उशिरापर्यंत वेगवेगळ्या बॅचमध्ये चालू असते. रविवारी आणि सार्वजनिक सुट्टीच्या दिवशी वेळ बदलू शकतो.'
          }
        ]
      },

      /* ========= HELP PAGE (Marathi) ========= */
      help: {
        hero: {
          title: 'मदत आणि मार्गदर्शक',
          subtitle: 'शिवबा काय ऑफर करतो ते पहा आणि सहज नेव्हिगेट करा.'
        },
        sections: {
          features: 'तुम्ही येथे काय करू शकता',
          shortcuts: 'कीबोर्ड शॉर्टकट्स'
        },
        labels: {
          proTip: 'प्रो टीप'
        },
        features: {
          talim: {
            title: 'शिवबा तालीम',
            desc: 'सर्वांगीण शक्तीसाठी डिझाइन केलेल्या आमच्या पारंपरिक आणि आधुनिक फिटनेस प्रोग्राम्समध्ये सामील व्हा.'
          },
          hostel: {
            title: 'हॉस्टेल सुविधा',
            desc: 'विद्यार्थी आणि नोकरदार व्यक्तींसाठी सुरक्षित आणि परवडणारी राहण्याची सोय.'
          },
          library: {
            title: 'लायब्ररी आणि अभ्यास',
            desc: 'शैक्षणिक वाढीसाठी समर्पित शांत आणि संसाधनांनी समृद्ध वातावरण.'
          },
          social: {
            title: 'सामाजिक भान',
            desc: 'सामाजिक कार्यशाळा आणि उपक्रमांमध्ये सहभागी व्हा.'
          },
          events: {
            title: 'इव्हेंट मॅनेजमेंट',
            desc: 'आगामी सांस्कृतिक आणि शैक्षणिक कार्यक्रम पहा आणि त्वरित नोंदणी करा.'
          },
          member: {
            title: 'मेंबर पोर्टल',
            desc: 'तुमच्या सबस्क्रिप्शन्सचा मागोवा घ्या आणि सदस्यत्व स्थिती ऑनलाइन तपासा.'
          }
        },
        shortcuts: {
          home: 'मुख्यपृष्ठ',
          about: 'आमच्याबद्दल',
          services: 'सेवा',
          events: 'कार्यक्रम',
          gallery: 'गॅलरी',
          contact: 'संपर्क',
          register: 'नोंदणी',
          account: 'माझे खाते',
          back: 'मागे जा',
          forward: 'पुढे जा',
          quickAccess: 'क्विक ॲक्सेस (सेवा पृष्ठावर)'
        },
        accessibility: {
          title: 'ॲक्सेसिबिलिटी पर्याय',
          desc_pre: 'रात्रीच्या वेळी वाचन सोपे करण्यासाठी उजव्या कोपऱ्यातील फ्लोटिंग बटण वापरून',
          darkMode: 'डार्क मोड',
          desc_post: 'चालू करा, किंवा पृष्ठाच्या शीर्षस्थानी त्वरित जा.'
        }
      }
    }
  },

  hi: {
    translation: {
      nav: {
        home: 'होम',
        about: 'हमारे बारे में',
        services: 'सेवाएँ',
        events: 'इवेंट्स',
        gallery: 'गैलरी',
        faq: 'प्रश्नोत्तर',
        help: 'सहायता',
        contact: 'संपर्क',
        myAccount: 'मेरा खाता',
        register: 'रजिस्टर'
      },

      hero: {
        latestUpdates: 'ताज़ा अपडेट',
        tickerText:
          'शिवबा तालिम में प्रवेश शुरू · लाइब्रेरी मेंबरशिप उपलब्ध · सीमित हॉस्टल सीटें · हमारी वर्कशॉप और सांस्कृतिक कार्यक्रमों में शामिल हों ·'
      },

      home: {
        heroTitle: 'शिवबा कम्युनिटी सेंटर में आपका स्वागत है',
        heroSubtitle:
          'फिटनेस, ज्ञान और कम्युनिटी – सब एक ही जगह। शिवबा तालिम, हॉस्टल, लाइब्रेरी और सामाजिक पहल से अपना रोज़मर्रा का जीवन बदलें.',
        heroPrimary: 'रजिस्ट्रेशन में रुचि दिखाएँ',
        heroSecondary: 'टीम से संपर्क करें',
        visitButton: 'शिवबा आएँ',
        stats: {
          membersNumber: '2000+',
          membersLabel: 'सक्रिय सदस्य',
          workshopsNumber: '500+',
          workshopsLabel: 'आयोजित कार्यशालाएँ',
          yearsNumber: '15',
          yearsLabel: 'सेवा के वर्ष'
        },
        slides: [
          {
            title: 'फिटनेस. फोकस. कम्युनिटी.',
            text:
              'आधुनिक उपकरणों और सहयोगी ट्रेनर्स के साथ शिवबा तालिम में ट्रेनिंग करें.',
            image: '/gym.jpg'
          },
          {
            title: 'शांति से पढ़ाई करें.',
            text:
              'शिवबा लाइब्रेरी में शांत और एकाग्र माहौल में परीक्षा की तैयारी करें.',
            image: '/Library.jpg'
          },
          {
            title: 'साथ रहो, साथ बढ़ो.',
            text:
              'कॉलेज और कोचिंग के पास स्थित शिवबा हॉस्टल में आरामदायक रहائش पाएँ.',
            image: '/hostel.jpg'
          }
        ],
        slideCounter: 'स्लाइड {{current}} / {{total}}',
        servicesTitle: 'शिवबा में आपको क्या मिलता है',
        servicesSubtitle:
          'आपकी शारीरिक, बौद्धिक और सामाजिक प्रगति को सहारा देने वाले चार स्तंभ.',
        cards: {
          talim: {
            title: 'शिवबा तालिम (जिम)',
            text:
              'ताकत और स्टैमिना बढ़ाने के लिए आधुनिक उपकरण, कोचिंग और ग्रुप वर्कआउट.'
          },
          hostel: {
            title: 'शिवबा हॉस्टल',
            text:
              'छात्रों और नौकरीपेशा लोगों के लिए सुरक्षित और आरामदायक रहने की सुविधा.'
          },
          library: {
            title: 'शिवबा लाइब्रेरी',
            text:
              'शांत जगह, समृद्ध पुस्तक संग्रह और एकाग्र अध्ययन का माहौल.'
          },
          social: {
            title: 'सामाजिक कार्यक्रम',
            text:
              'जागरूकता कार्यक्रम, गेस्ट लेक्चर और समुदाय के लिए सांस्कृतिक आयोजन.'
          }
        },
        ctaTitle: 'शिवबा आने के लिए तैयार हैं?',
        ctaSubtitle:
          'जाधव कमर्शियल सेंटर, चाकण पर आएँ, या हमें अपनी जानकारी भेजें; हम आपको मेंबरशिप विकल्प समझाएँगे.',
        ctaPrimary: 'अभी रजिस्टर करें',
        ctaSecondary: 'मार्गदर्शन पाएँ'
      },

      about: {
        heroTitle: 'शिवबा के बारे में',
        heroSubtitle: '२०१० से शरीर, मन और समाज को मज़बूत बनाने की पहल.',
        storyTitle: 'हमारी कहानी',
        storyParagraph1:
          '२०१० में शुरू हुआ शिवबा शुरुआत में फिटनेस और वेलनेस को बढ़ावा देने वाली छोटी पहल थी, जो आज एक पूर्ण सामुदायिक केंद्र बन चुका है.',
        storyParagraph2:
          'आज शिवबा तालिम के माध्यम से शारीरिक फिटनेस, लाइब्रेरी के माध्यम से बौद्धिक विकास, शिवबा हॉस्टल में आरामदायक रहائش और सामाजिक जागरूकता कार्यक्रमों के ज़रिये लोगों को जोड़ता है.',
        drivesTitle: 'हमें आगे बढ़ाने वाली बातें',
        missionTitle: 'हमारा मिशन',
        missionText:
          'शारीरिक, बौद्धिक और सामाजिक विकास के माध्यम से हर व्यक्ति को समग्र रूप से सशक्त बनाना.',
        visionTitle: 'हमारा विज़न',
        visionText:
          'फिटनेस, शिक्षा और सांस्कृतिक गतिविधियों के ज़रिये जीवन बदलने वाला अग्रणी सामुदायिक केंद्र बनना.',
        valuesTitle: 'हमारे मूल्य',
        valuesText:
          'ईमानदारी, समावेशिता, उत्कृष्टता और समाजसेवा हमारे हर निर्णय की नींव हैं.',
        commitmentTitle: 'हमारी प्रतिबद्धता',
        commitmentText:
          'हर सदस्य के लिए सुरक्षित स्थान, आधुनिक सुविधाएँ और सहायक कार्यक्रम उपलब्ध कराना हमारी ज़िम्मेदारी है.',
        teamTitle: 'हमारी नेतृत्व टीम',
        team1: { name: 'अनिकेत ठाकूर', role: 'संस्थापक और निदेशक' },
        team2: { name: 'हर्षदा ठाकूर', role: 'ऑपरेशंस मैनेजर' },
        team3: { name: 'स्वप्निल लोकरे', role: 'प्रोग्राम कोऑर्डिनेटर' }
      },

      faq: {
        heroTitle: 'अक्सर पूछे जाने वाले प्रश्न',
        heroSubtitle:
          'हमारी सेवाओं और सुविधाओं से जुड़े आम सवालों के जवाब यहाँ मिलेंगे.',
        searchPlaceholder: 'सर्च करें (मेंबरशिप, हॉस्टल, पेमेंट्स...)',
        noResults: 'आपकी खोज के लिए कोई प्रश्न नहीं मिला.',
        chatTitle: 'शिवबा असिस्टेंट से पूछें',
        chatSubtitle:
          'अपना सवाल लिखें, हम FAQs में से उसके जैसा जवाब सुझाएँगे.',
        chatPlaceholder: 'जैसे: जिम का टाइम टेबल क्या है?',
        chatButton: 'उत्तर पाएँ',
        chatLabel: 'सहायक:',
        chatMatch:
          '“{{question}}” के बारे में हम आम तौर पर ऐसा कहते हैं: {{answer}}',
        chatNoMatch:
          'इस प्रश्न के लिए टीम की जाँच ज़रूरी है। कृपया नीचे “Email Us” बटन या कॉन्टैक्ट पेज का उपयोग करें, हम जल्द ही जवाब देंगे.',
        ctaTitle: 'अब भी सवाल हैं?',
        ctaSubtitle: 'किसी भी जानकारी के लिए हमारी टीम आपकी मदद को तैयार है.',
        ctaButton: 'ईमेल करें',
        items: [
          {
            id: 1,
            category: 'मेंबरशिप',
            question: 'शिवबा तालिम की सदस्यता कैसे लें?',
            answer:
              'आप कार्य समय में हमारे सेंटर पर आएँ या वेबसाइट पर “Register” बटन का उपयोग करें। हमारी टीम आपको सही मेंबरशिप प्लान चुनने में मदद करेगी.'
          },
          {
            id: 2,
            category: 'मेंबरशिप',
            question: 'क्या ट्रायल सत्र मिलते हैं?',
            answer:
              'हाँ, हम समय‑समय पर फ्री ट्रायल डे और इंट्रो सेशन चलाते हैं। चल रही ऑफ़र्स के लिए इवेंट्स पेज देखें या हमसे संपर्क करें.'
          },
          {
            id: 3,
            category: 'हॉस्टल',
            question: 'क्या छात्रों के लिए हॉस्टल उपलब्ध है?',
            answer:
              'हाँ। शिवबा हॉस्टल में छात्रों और नौकरीपेशा लोगों के लिए साझा और सीमित सिंगल रूम उपलब्ध हैं (उपलब्धता के अनुसार).'
          },
          {
            id: 4,
            category: 'पेमेंट',
            question: 'आप किन पेमेंट तरीकों को स्वीकार करते हैं?',
            answer:
              'हम UPI, प्रमुख डेबिट/क्रेडिट कार्ड, नेट बैंकिंग और रिसेप्शन पर कैश स्वीकार करते हैं.'
          },
          {
            id: 5,
            category: 'समय',
            question: 'जिम का टाइमिंग क्या है?',
            answer:
              'जिम आम तौर पर सुबह जल्दी से रात देर तक अलग‑अलग बैच में खुला रहता है। रविवार और सरकारी छुट्टियों पर समय बदल सकता है.'
          }
        ]
      },

      /* ========= HELP PAGE (Hindi) ========= */
      help: {
        hero: {
          title: 'सहायता और मार्गदर्शन',
          subtitle: 'जानें शिवबा क्या प्रदान करता है और आसानी से नेविगेट करें।'
        },
        sections: {
          features: 'आप यहाँ क्या कर सकते हैं',
          shortcuts: 'कीबोर्ड शॉर्टकट्स'
        },
        labels: {
          proTip: 'प्रो टिप'
        },
        features: {
          talim: {
            title: 'शिवबा तालिम',
            desc: 'समग्र शक्ति के लिए डिज़ाइन किए गए हमारे पारंपरिक और आधुनिक फिटनेस कार्यक्रमों में शामिल हों।'
          },
          hostel: {
            title: 'हॉस्टल सुविधाएँ',
            desc: 'छात्रों और कामकाजी पेशेवरों के लिए सुरक्षित और किफायती आवास।'
          },
          library: {
            title: 'लाइब्रेरी और अध्ययन',
            desc: 'शैक्षणिक विकास के लिए समर्पित एक शांत और संसाधनों से समृद्ध वातावरण।'
          },
          social: {
            title: 'सामाजिक जागरूकता',
            desc: 'सामुदायिक कार्यशालाओं और सामाजिक अभियानों में भाग लें।'
          },
          events: {
            title: 'इवेंट मैनेजमेंट',
            desc: 'आगामी सांस्कृतिक और शैक्षिक कार्यक्रमों को ब्राउज़ करें और तुरंत रजिस्टर करें।'
          },
          member: {
            title: 'मेंबर पोर्टल',
            desc: 'अपनी सदस्यता देखें और ऑनलाइन स्टेटस वेरिफाई करें।'
          }
        },
        shortcuts: {
          home: 'होम पेज',
          about: 'हमारे बारे में',
          services: 'सेवाएँ',
          events: 'इवेंट्स',
          gallery: 'गैलरी',
          contact: 'संपर्क',
          register: 'रजिस्टर',
          account: 'मेरा खाता',
          back: 'पीछे जाएँ',
          forward: 'आगे बढ़ें',
          quickAccess: 'क्विक एक्सेस (सेवा पेज पर)'
        },
        accessibility: {
          title: 'एक्सेसिबिलिटी विकल्प',
          desc_pre: 'रात में पढ़ना आसान बनाने के लिए निचले दाएँ कोने में फ्लोटिंग बटन का उपयोग करके',
          darkMode: 'डार्क मोड',
          desc_post: 'टोगल करें, या तुरंत पेज के ऊपर जाएँ।'
        }
      }
    }
  }
};

i18n.use(initReactI18next).init({
  resources,
  lng: 'en',
  fallbackLng: 'en',
  interpolation: { escapeValue: false }
});

export default i18n;