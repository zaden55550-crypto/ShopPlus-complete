import { LANGS, type Lang } from './i18n';

// Each row follows LANGS order. Product names and currency codes remain unchanged.
const rows = `
Log In|Ingia|Se connecter|تسجيل الدخول|Iniciar sesión|Entrar|Anmelden|Accedi|登录|लॉग इन|Gal
Sign in to your shop account|Ingia kwenye akaunti ya duka lako|Connectez-vous au compte de votre boutique|سجّل الدخول إلى حساب متجرك|Accede a la cuenta de tu tienda|Entre na conta da sua loja|Melden Sie sich bei Ihrem Shopkonto an|Accedi al tuo negozio|登录您的店铺账户|अपनी दुकान के खाते में प्रवेश करें|Gal akoonka dukaankaaga
Shop Name or Email|Jina la duka au barua pepe|Nom de boutique ou e-mail|اسم المتجر أو البريد الإلكتروني|Nombre de tienda o correo|Nome da loja ou e-mail|Shopname oder E-Mail|Nome negozio o email|店铺名称或邮箱|दुकान का नाम या ईमेल|Magaca dukaanka ama iimaylka
Password|Nenosiri|Mot de passe|كلمة المرور|Contraseña|Senha|Passwort|Password|密码|पासवर्ड|Furaha sirta
Remember me|Nikumbuke|Se souvenir de moi|تذكرني|Recordarme|Lembrar de mim|Angemeldet bleiben|Ricordami|记住我|मुझे याद रखें|I xusuuso
Forgot Password?|Umesahau nenosiri?|Mot de passe oublié ?|نسيت كلمة المرور؟|¿Olvidaste la contraseña?|Esqueceu a senha?|Passwort vergessen?|Password dimenticata?|忘记密码？|पासवर्ड भूल गए?|Ma illowday furaha sirta?
Ask your shop admin to reset your password.|Mwombe msimamizi wa duka abadilishe nenosiri lako.|Demandez à votre administrateur de réinitialiser votre mot de passe.|اطلب من مسؤول المتجر إعادة تعيين كلمة المرور.|Pide al administrador que restablezca tu contraseña.|Peça ao administrador para redefinir sua senha.|Bitten Sie Ihren Shopadministrator, Ihr Passwort zurückzusetzen.|Chiedi all’amministratore di reimpostare la password.|请联系店铺管理员重置密码。|दुकान के व्यवस्थापक से पासवर्ड रीसेट करने को कहें।|Maamulaha dukaankaaga ka codso inuu furaha sirta kuu beddelo.
Shop name, email or password is incorrect|Jina la duka, barua pepe au nenosiri si sahihi|Nom de boutique, e-mail ou mot de passe incorrect|اسم المتجر أو البريد الإلكتروني أو كلمة المرور غير صحيحة|Nombre, correo o contraseña incorrectos|Nome, e-mail ou senha incorretos|Shopname, E-Mail oder Passwort ist falsch|Nome, email o password non corretti|店铺名称、邮箱或密码不正确|दुकान का नाम, ईमेल या पासवर्ड गलत है|Magaca dukaanka, iimaylka ama furaha sirta waa khalad
OR|AU|OU|أو|O|OU|ODER|OPPURE|或|या|AMA
Create Account|Fungua akaunti|Créer un compte|إنشاء حساب|Crear cuenta|Criar conta|Konto erstellen|Crea account|创建账户|खाता बनाएँ|Samee akoon
Create Your Account|Fungua akaunti yako|Créez votre compte|أنشئ حسابك|Crea tu cuenta|Crie sua conta|Erstellen Sie Ihr Konto|Crea il tuo account|创建您的账户|अपना खाता बनाएँ|Samee akoonkaaga
Shop Name|Jina la duka|Nom de la boutique|اسم المتجر|Nombre de la tienda|Nome da loja|Shopname|Nome del negozio|店铺名称|दुकान का नाम|Magaca dukaanka
Email|Barua pepe|E-mail|البريد الإلكتروني|Correo electrónico|E-mail|E-Mail|Email|邮箱|ईमेल|Iimayl
Confirm Password|Thibitisha nenosiri|Confirmer le mot de passe|تأكيد كلمة المرور|Confirmar contraseña|Confirmar senha|Passwort bestätigen|Conferma password|确认密码|पासवर्ड की पुष्टि करें|Xaqiiji furaha sirta
I agree to the Terms & Conditions and Privacy Policy|Nakubali Masharti na Sera ya Faragha|J’accepte les conditions générales et la politique de confidentialité|أوافق على الشروط والأحكام وسياسة الخصوصية|Acepto los términos y la política de privacidad|Aceito os termos e a política de privacidade|Ich akzeptiere die AGB und die Datenschutzerklärung|Accetto i termini e l’informativa sulla privacy|我同意条款和隐私政策|मैं नियमों और गोपनीयता नीति से सहमत हूँ|Waxaan oggolahay Shuruudaha iyo Siyaasadda Asturnaanta
Already have an account?|Tayari una akaunti?|Vous avez déjà un compte ?|لديك حساب بالفعل؟|¿Ya tienes una cuenta?|Já tem uma conta?|Sie haben bereits ein Konto?|Hai già un account?|已有账户？|पहले से खाता है?|Akoon ma leedahay?
Password must be at least 6 characters|Nenosiri liwe na angalau herufi 6|Le mot de passe doit contenir au moins 6 caractères|يجب أن تتكون كلمة المرور من 6 أحرف على الأقل|La contraseña debe tener al menos 6 caracteres|A senha deve ter pelo menos 6 caracteres|Das Passwort muss mindestens 6 Zeichen haben|La password deve avere almeno 6 caratteri|密码至少需要6个字符|पासवर्ड में कम से कम 6 अक्षर होने चाहिए|Furaha sirta ha noqdo ugu yaraan 6 xaraf
Passwords do not match|Manenosiri hayafanani|Les mots de passe ne correspondent pas|كلمتا المرور غير متطابقتين|Las contraseñas no coinciden|As senhas não coincidem|Die Passwörter stimmen nicht überein|Le password non coincidono|密码不一致|पासवर्ड मेल नहीं खाते|Furayaasha sirta isma waafaqaan
Please accept the Terms & Privacy Policy|Tafadhali kubali Masharti na Sera ya Faragha|Veuillez accepter les conditions et la politique de confidentialité|يرجى الموافقة على الشروط وسياسة الخصوصية|Acepta los términos y la política de privacidad|Aceite os termos e a política de privacidade|Bitte akzeptieren Sie die AGB und Datenschutzerklärung|Accetta i termini e l’informativa sulla privacy|请同意条款和隐私政策|कृपया नियमों और गोपनीयता नीति को स्वीकार करें|Fadlan oggolow Shuruudaha iyo Siyaasadda Asturnaanta
Change logo|Badilisha nembo|Changer le logo|تغيير الشعار|Cambiar logo|Alterar logotipo|Logo ändern|Cambia logo|更换标志|लोगो बदलें|Beddel astaanta
Upload shop logo|Pakia nembo ya duka|Importer le logo|تحميل شعار المتجر|Subir logo de tienda|Enviar logotipo da loja|Shoplogo hochladen|Carica logo del negozio|上传店铺标志|दुकान का लोगो अपलोड करें|Soo geli astaanta dukaanka
Shop logo|Nembo ya duka|Logo de boutique|شعار المتجر|Logo de tienda|Logotipo da loja|Shoplogo|Logo del negozio|店铺标志|दुकान का लोगो|Astaanta dukaanka
Show password|Onyesha nenosiri|Afficher le mot de passe|إظهار كلمة المرور|Mostrar contraseña|Mostrar senha|Passwort anzeigen|Mostra password|显示密码|पासवर्ड दिखाएँ|Muuji furaha sirta
Hide password|Ficha nenosiri|Masquer le mot de passe|إخفاء كلمة المرور|Ocultar contraseña|Ocultar senha|Passwort verbergen|Nascondi password|隐藏密码|पासवर्ड छिपाएँ|Qari furaha sirta
Dark mode|Hali ya giza|Mode sombre|الوضع الداكن|Modo oscuro|Modo escuro|Dunkler Modus|Modalità scura|深色模式|डार्क मोड|Muuqaal madow
Light mode|Hali ya mwanga|Mode clair|الوضع الفاتح|Modo claro|Modo claro|Heller Modus|Modalità chiara|浅色模式|लाइट मोड|Muuqaal iftiin
Kenyan Shilling|Shilingi ya Kenya|Shilling kényan|الشلن الكيني|Chelín keniano|Xelim queniano|Kenianischer Schilling|Scellino keniota|肯尼亚先令|केन्याई शिलिंग|Shilinka Kenya
Ugandan Shilling|Shilingi ya Uganda|Shilling ougandais|الشلن الأوغندي|Chelín ugandés|Xelim ugandês|Ugandischer Schilling|Scellino ugandese|乌干达先令|युगांडाई शिलिंग|Shilinka Uganda
Tanzanian Shilling|Shilingi ya Tanzania|Shilling tanzanien|الشلن التنزاني|Chelín tanzano|Xelim tanzaniano|Tansanischer Schilling|Scellino tanzaniano|坦桑尼亚先令|तंजानियाई शिलिंग|Shilinka Tanzania
US Dollar|Dola ya Marekani|Dollar américain|الدولار الأمريكي|Dólar estadounidense|Dólar americano|US-Dollar|Dollaro USA|美元|अमेरिकी डॉलर|Doolarka Maraykanka
Choose Your Plan|Chagua mpango wako|Choisissez votre forfait|اختر خطتك|Elige tu plan|Escolha seu plano|Wählen Sie Ihren Tarif|Scegli il tuo piano|选择您的套餐|अपनी योजना चुनें|Dooro qorshahaaga
Unlock more features and grow your business with SHOPBOOK|Fungua huduma zaidi na kukuza biashara yako na SHOPBOOK|Accédez à plus de fonctionnalités et développez votre activité avec SHOPBOOK|افتح المزيد من الميزات ونمِّ أعمالك مع SHOPBOOK|Accede a más funciones y haz crecer tu negocio con SHOPBOOK|Tenha mais recursos e amplie seu negócio com SHOPBOOK|Nutzen Sie mehr Funktionen und wachsen Sie mit SHOPBOOK|Sblocca più funzioni e fai crescere la tua attività con SHOPBOOK|使用 SHOPBOOK 解锁更多功能并拓展业务|SHOPBOOK के साथ अधिक सुविधाएँ पाएँ और अपना व्यवसाय बढ़ाएँ|Hel adeegyo dheeraad ah oo ganacsigaaga ku kobci SHOPBOOK
Monthly|Kila mwezi|Mensuel|شهري|Mensual|Mensal|Monatlich|Mensile|月付|मासिक|Bille
Yearly (Save 10%)|Kila mwaka (Okoa 10%)|Annuel (−10 %)|سنوي (وفّر 10٪)|Anual (Ahorra 10%)|Anual (Economize 10%)|Jährlich (10% sparen)|Annuale (Risparmia 10%)|年付（省10%）|वार्षिक (10% बचाएँ)|Sannadle (Kaydi 10%)
Save 10%|Okoa 10%|Économisez 10 %|وفّر 10٪|Ahorra 10%|Economize 10%|10% sparen|Risparmia 10%|省10%|10% बचाएँ|Kaydi 10%
BEST OPTION|CHAGUO BORA|MEILLEUR CHOIX|أفضل خيار|MEJOR OPCIÓN|MELHOR OPÇÃO|BESTE WAHL|SCELTA MIGLIORE|最佳选择|सर्वश्रेष्ठ विकल्प|DOORASHADA UGU FIICAN
/ month|/ mwezi|/ mois|/ شهر|/ mes|/ mês|/ Monat|/ mese|/ 月|/ माह|/ bishii
/ year|/ mwaka|/ an|/ سنة|/ año|/ ano|/ Jahr|/ anno|/ 年|/ वर्ष|/ sannadkii
Billed yearly|Hulipwa kila mwaka|Facturé annuellement|تُدفع سنويًا|Facturado anualmente|Cobrado anualmente|Jährliche Abrechnung|Fatturato annualmente|按年计费|वार्षिक बिलिंग|Sannad kasta la bixiyo
Start selling.|Anza kuuza.|Commencez à vendre.|ابدأ البيع.|Empieza a vender.|Comece a vender.|Starten Sie den Verkauf.|Inizia a vendere.|开始销售。|बिक्री शुरू करें।|Bilow iibinta.
Manage your growing shop.|Simamia duka lako linalokua.|Gérez votre boutique en croissance.|أدِر متجرك المتنامي.|Gestiona tu tienda en crecimiento.|Gerencie sua loja em crescimento.|Verwalten Sie Ihren wachsenden Shop.|Gestisci il tuo negozio in crescita.|管理不断发展的店铺。|अपनी बढ़ती दुकान का प्रबंधन करें।|Maamul dukaankaaga koraya.
Run the whole business.|Endesha biashara nzima.|Gérez toute votre activité.|أدِر النشاط التجاري بالكامل.|Dirige todo tu negocio.|Gerencie todo o negócio.|Steuern Sie Ihr gesamtes Unternehmen.|Gestisci l’intera attività.|管理整个企业。|पूरा व्यवसाय चलाएँ।|Maamul ganacsiga oo dhan.
Everything in Basic, plus:|Yote ya Basic, pamoja na:|Tout Basic, plus :|كل ما في Basic، بالإضافة إلى:|Todo lo de Basic, más:|Tudo do Basic, mais:|Alles aus Basic, plus:|Tutto di Basic, più:|Basic 的所有功能，另加：|Basic की सभी सुविधाएँ, साथ में:|Wax kasta oo Basic ku jira, iyo:
Everything in Plus, plus:|Yote ya Plus, pamoja na:|Tout Plus, plus :|كل ما في Plus، بالإضافة إلى:|Todo lo de Plus, más:|Tudo do Plus, mais:|Alles aus Plus, plus:|Tutto di Plus, più:|Plus 的所有功能，另加：|Plus की सभी सुविधाएँ, साथ में:|Wax kasta oo Plus ku jira, iyo:
Continue with {x} Plan|Endelea na mpango wa {x}|Continuer avec le forfait {x}|المتابعة بخطة {x}|Continuar con el plan {x}|Continuar com o plano {x}|Mit Tarif {x} fortfahren|Continua con il piano {x}|继续选择 {x} 套餐|{x} योजना के साथ जारी रखें|Ku sii wad qorshaha {x}
Get Started with Your 30-Day Free Trial|Anza majaribio ya bure ya siku 30|Commencer l’essai gratuit de 30 jours|ابدأ تجربتك المجانية لمدة 30 يومًا|Comienza tu prueba gratis de 30 días|Comece seu teste grátis de 30 dias|30 Tage kostenlos testen|Inizia la prova gratuita di 30 giorni|开始30天免费试用|30 दिन का निःशुल्क परीक्षण शुरू करें|Bilow tijaabadaada bilaashka ah ee 30 maalmood
No payment required • Cancel anytime|Hakuna malipo • Ghairi wakati wowote|Sans paiement • Annulez à tout moment|لا يتطلب الدفع • ألغِ في أي وقت|Sin pago • Cancela cuando quieras|Sem pagamento • Cancele quando quiser|Keine Zahlung nötig • Jederzeit kündbar|Nessun pagamento • Annulla quando vuoi|无需付款 • 随时取消|भुगतान आवश्यक नहीं • कभी भी रद्द करें|Lacag looma baahna • Jooji goor kasta
Pay with M-Pesa|Lipa kwa M-Pesa|Payer avec M-Pesa|الدفع عبر M-Pesa|Pagar con M-Pesa|Pagar com M-Pesa|Mit M-Pesa bezahlen|Paga con M-Pesa|使用 M-Pesa 支付|M-Pesa से भुगतान करें|Ku bixi M-Pesa
M-Pesa phone number|Nambari ya simu ya M-Pesa|Numéro M-Pesa|رقم هاتف M-Pesa|Número de M-Pesa|Número de M-Pesa|M-Pesa-Telefonnummer|Numero M-Pesa|M-Pesa 手机号|M-Pesa फ़ोन नंबर|Lambarka taleefanka M-Pesa
Send payment request|Tuma ombi la malipo|Envoyer la demande de paiement|إرسال طلب الدفع|Enviar solicitud de pago|Enviar pedido de pagamento|Zahlungsanfrage senden|Invia richiesta di pagamento|发送付款请求|भुगतान अनुरोध भेजें|Dir codsiga lacag-bixinta
Use the 30-day free trial instead|Tumia majaribio ya bure ya siku 30 badala yake|Utiliser l’essai gratuit de 30 jours|استخدم التجربة المجانية لمدة 30 يومًا بدلًا من ذلك|Usar la prueba gratis de 30 días|Usar o teste grátis de 30 dias|Stattdessen 30 Tage kostenlos testen|Usa invece la prova gratuita di 30 giorni|改用30天免费试用|इसके बजाय 30 दिन का निःशुल्क परीक्षण लें|Bedelkeeda isticmaal tijaabada bilaashka ah ee 30 maalmood
Your plan is only activated after payment is confirmed.|Mpango wako unaanza baada ya malipo kuthibitishwa.|Votre forfait est activé après confirmation du paiement.|تُفعّل خطتك فقط بعد تأكيد الدفع.|Tu plan se activa al confirmar el pago.|Seu plano é ativado após confirmar o pagamento.|Ihr Tarif wird erst nach Zahlungsbestätigung aktiviert.|Il piano si attiva dopo la conferma del pagamento.|付款确认后才会激活套餐。|भुगतान की पुष्टि के बाद ही योजना सक्रिय होगी।|Qorshahaaga wuxuu shaqaynayaa marka lacag-bixinta la xaqiijiyo.
Enter a valid Kenyan M-Pesa phone number|Weka nambari sahihi ya M-Pesa ya Kenya|Saisissez un numéro M-Pesa kényan valide|أدخل رقم هاتف M-Pesa كينيًا صالحًا|Introduce un número M-Pesa keniano válido|Insira um número M-Pesa queniano válido|Geben Sie eine gültige kenianische M-Pesa-Nummer ein|Inserisci un numero M-Pesa keniota valido|请输入有效的肯尼亚 M-Pesa 手机号|एक मान्य केन्याई M-Pesa नंबर डालें|Geli lambar M-Pesa Kenya oo sax ah
Online payments are coming soon. Start the free trial for now — your data stays when you upgrade.|Malipo ya mtandaoni yanakuja. Anza majaribio ya bure — data yako itabaki ukiboresha.|Les paiements en ligne arrivent bientôt. Essayez gratuitement : vos données seront conservées.|الدفع الإلكتروني قريبًا. ابدأ التجربة المجانية الآن — تبقى بياناتك عند الترقية.|Los pagos en línea llegarán pronto. Prueba gratis; tus datos se conservan al mejorar.|Pagamentos online em breve. Comece o teste grátis; seus dados ficam ao atualizar.|Onlinezahlungen folgen bald. Starten Sie die Testphase; Ihre Daten bleiben beim Upgrade erhalten.|I pagamenti online arriveranno presto. Inizia la prova: i dati restano dopo l’upgrade.|在线支付即将推出。请先免费试用，升级时会保留数据。|ऑनलाइन भुगतान जल्द आएगा। अभी निःशुल्क परीक्षण लें; अपग्रेड पर डेटा रहेगा।|Lacag-bixinta onlaynka ah way soo socotaa. Hadda bilow tijaabada bilaashka ah — xogtaadu way sii jiraysaa markaad qorshaha kor u qaaddo.
Dashboard basic|Dashibodi ya msingi|Tableau de bord de base|لوحة تحكم أساسية|Panel básico|Painel básico|Basis-Dashboard|Dashboard base|基础仪表盘|बुनियादी डैशबोर्ड|Loox kooban
Basic products|Bidhaa za msingi|Produits de base|منتجات أساسية|Productos básicos|Produtos básicos|Basis-Produkte|Prodotti base|基础商品|बुनियादी उत्पाद|Alaabooyinka aasaasiga ah
Basic history|Historia ya msingi|Historique de base|سجل أساسي|Historial básico|Histórico básico|Basis-Verlauf|Cronologia base|基础历史记录|बुनियादी इतिहास|Taariikhda aasaasiga ah
Basic settings|Mipangilio ya msingi|Paramètres de base|إعدادات أساسية|Ajustes básicos|Configurações básicas|Basis-Einstellungen|Impostazioni base|基础设置|बुनियादी सेटिंग्स|Dejimaha aasaasiga ah
Returns|Marejesho|Retours|المرتجعات|Devoluciones|Devoluções|Retouren|Resi|退货|वापसी|Alaab-celin
Credit & partial|Mkopo na malipo ya sehemu|Crédit et paiements partiels|ائتمان ودفع جزئي|Crédito y pagos parciales|Crédito e pagamentos parciais|Kredit und Teilzahlungen|Credito e pagamenti parziali|赊账和部分付款|उधार और आंशिक भुगतान|Deyn iyo qayb-bixin
Mixed payments|Malipo mchanganyiko|Paiements mixtes|مدفوعات مختلطة|Pagos mixtos|Pagamentos mistos|Gemischte Zahlungen|Pagamenti misti|混合付款|मिश्रित भुगतान|Lacag-bixin isku dhafan
Cash-up (end of day)|Hesabu ya fedha (mwisho wa siku)|Clôture de caisse|إقفال الصندوق (نهاية اليوم)|Cierre de caja|Fechamento de caixa|Kassenabschluss|Chiusura cassa|日终结账|दिन के अंत में नकद मिलान|Xisaab-xir (dhammaadka maalinta)
Settings (advanced)|Mipangilio ya juu|Paramètres avancés|إعدادات متقدمة|Ajustes avanzados|Configurações avançadas|Erweiterte Einstellungen|Impostazioni avanzate|高级设置|उन्नत सेटिंग्स|Dejimaha (heer sare)
Advanced analytics|Uchambuzi wa juu|Analyses avancées|تحليلات متقدمة|Análisis avanzados|Análises avançadas|Erweiterte Analysen|Analisi avanzate|高级分析|उन्नत विश्लेषण|Falanqayn heer sare ah
Advanced AI|AI ya juu|IA avancée|ذكاء اصطناعي متقدم|IA avanzada|IA avançada|Erweiterte KI|IA avanzata|高级AI|उन्नत AI|AI heer sare ah
Advanced permissions|Ruhusa za juu|Autorisations avancées|صلاحيات متقدمة|Permisos avanzados|Permissões avançadas|Erweiterte Berechtigungen|Permessi avanzati|高级权限|उन्नत अनुमतियाँ|Rukhsado heer sare ah
Multi-shop|Maduka mengi|Multi-boutiques|متاجر متعددة|Varias tiendas|Várias lojas|Mehrere Shops|Più negozi|多店铺|कई दुकानें|Dukaamo badan
Advanced integrations|Miunganisho ya juu|Intégrations avancées|تكاملات متقدمة|Integraciones avanzadas|Integrações avançadas|Erweiterte Integrationen|Integrazioni avanzate|高级集成|उन्नत एकीकरण|Isku-xirro heer sare ah
Custom reports|Ripoti maalum|Rapports personnalisés|تقارير مخصصة|Informes personalizados|Relatórios personalizados|Individuelle Berichte|Report personalizzati|自定义报表|कस्टम रिपोर्ट|Warbixinno gaar ah
Priority support|Msaada wa kipaumbele|Support prioritaire|دعم ذو أولوية|Soporte prioritario|Suporte prioritário|Prioritäts-Support|Supporto prioritario|优先支持|प्राथमिकता समर्थन|Taageero mudnaan leh
Full settings access|Ufikiaji kamili wa mipangilio|Accès complet aux paramètres|وصول كامل للإعدادات|Acceso completo a ajustes|Acesso total às configurações|Voller Einstellungszugriff|Accesso completo alle impostazioni|完整设置权限|सभी सेटिंग्स की पहुँच|Helitaanka dhammaan dejimaha
Call support|Piga simu kwa msaada|Appeler le support|اتصل بالدعم|Llamar al soporte|Ligar para o suporte|Support anrufen|Chiama il supporto|致电支持|समर्थन को कॉल करें|Wac taageerada
Menu|Menyu|Menu|القائمة|Menú|Menu|Menü|Menu|菜单|मेन्यू|Liiska
Close menu|Funga menyu|Fermer le menu|إغلاق القائمة|Cerrar menú|Fechar menu|Menü schließen|Chiudi menu|关闭菜单|मेन्यू बंद करें|Xir liiska
Notifications|Arifa|Notifications|الإشعارات|Notificaciones|Notificações|Benachrichtigungen|Notifiche|通知|सूचनाएँ|Ogeysiisyo
AI assistant|Msaidizi wa AI|Assistant IA|المساعد الذكي|Asistente IA|Assistente IA|KI-Assistent|Assistente IA|AI助手|AI सहायक|Kaaliyaha AI
Sign in with Google for AI|Ingia kwa Google kutumia AI|Se connecter avec Google pour l’IA|تسجيل الدخول عبر Google للذكاء الاصطناعي|Entrar con Google para IA|Entrar com Google para IA|Mit Google für KI anmelden|Accedi con Google per l’IA|通过 Google 登录使用 AI|AI के लिए Google से साइन इन करें|Google ku gal si aad AI u isticmaasho
Confirm Stock In|Thibitisha kuingiza bidhaa|Confirmer l’entrée de stock|تأكيد إدخال المخزون|Confirmar entrada|Confirmar entrada|Bestandseingang bestätigen|Conferma entrata scorte|确认入库|स्टॉक आवक की पुष्टि करें|Xaqiiji alaab-gelinta
Confirm Stock Out|Thibitisha kutoa bidhaa|Confirmer la sortie de stock|تأكيد إخراج المخزون|Confirmar salida|Confirmar saída|Bestandsabgang bestätigen|Conferma uscita scorte|确认出库|स्टॉक जावक की पुष्टि करें|Xaqiiji alaab-saarista
Confirm Adjustment|Thibitisha marekebisho|Confirmer l’ajustement|تأكيد التسوية|Confirmar ajuste|Confirmar ajuste|Korrektur bestätigen|Conferma rettifica|确认调整|समायोजन की पुष्टि करें|Xaqiiji sixitaanka
Confirm Cash-up|Thibitisha hesabu ya fedha|Confirmer la clôture|تأكيد إقفال الصندوق|Confirmar cierre de caja|Confirmar fechamento|Kassenabschluss bestätigen|Conferma chiusura cassa|确认结账|नकद मिलान की पुष्टि करें|Xaqiiji xisaab-xirka lacagta
Opening stock|Bidhaa za mwanzo|Stock initial|المخزون الافتتاحي|Existencias iniciales|Estoque inicial|Anfangsbestand|Scorte iniziali|期初库存|प्रारंभिक स्टॉक|Kaydka bilowga
Failed|Imeshindikana|Échec|فشل|Error|Falhou|Fehlgeschlagen|Operazione fallita|失败|विफल|Fashilmay
Stopped|Imesimamishwa|Arrêté|تم الإيقاف|Detenido|Interrompido|Gestoppt|Interrotto|已停止|रोक दिया गया|Joogsaday
Not enough stock for {name} (available {qty})|Bidhaa hazitoshi kwa {name} (zilizopo {qty})|Stock insuffisant pour {name} (disponible {qty})|المخزون غير كافٍ لـ {name} (المتاح {qty})|Stock insuficiente de {name} (disponible {qty})|Estoque insuficiente de {name} (disponível {qty})|Nicht genug Bestand für {name} (verfügbar {qty})|Scorte insufficienti per {name} (disponibili {qty})|{name} 库存不足（可用 {qty}）|{name} का स्टॉक अपर्याप्त (उपलब्ध {qty})|Kayd kuma filna {name} (la heli karo {qty})
Invalid quantity for {name}|Idadi si sahihi kwa {name}|Quantité invalide pour {name}|كمية غير صالحة لـ {name}|Cantidad no válida para {name}|Quantidade inválida para {name}|Ungültige Menge für {name}|Quantità non valida per {name}|{name} 数量无效|{name} की मात्रा अमान्य|Tirada {name} ma saxna
Insufficient stock: {name} (available {qty})|Bidhaa hazitoshi: {name} (zilizopo {qty})|Stock insuffisant : {name} (disponible {qty})|مخزون غير كافٍ: {name} (المتاح {qty})|Stock insuficiente: {name} (disponible {qty})|Estoque insuficiente: {name} (disponível {qty})|Unzureichender Bestand: {name} (verfügbar {qty})|Scorte insufficienti: {name} (disponibili {qty})|库存不足：{name}（可用 {qty}）|अपर्याप्त स्टॉक: {name} (उपलब्ध {qty})|Kayd aan ku filnayn: {name} (la heli karo {qty})
Only {qty} of {name} can be returned|Ni {qty} tu za {name} zinaweza kurejeshwa|Seulement {qty} de {name} peuvent être retournés|يمكن إرجاع {qty} فقط من {name}|Solo se pueden devolver {qty} de {name}|Só podem ser devolvidos {qty} de {name}|Nur {qty} von {name} können retourniert werden|È possibile restituire solo {qty} di {name}|{name} 最多可退 {qty} 件|{name} की केवल {qty} इकाइयाँ लौटाई जा सकती हैं|Kaliya {qty} oo {name} ah ayaa la celin karaa
A reason is required|Sababu inahitajika|Un motif est requis|السبب مطلوب|Se requiere un motivo|É necessário um motivo|Ein Grund ist erforderlich|È richiesto un motivo|必须填写原因|कारण आवश्यक है|Sabab ayaa loo baahan yahay
ADJUSTMENT|MAREKEBISHO|AJUSTEMENT|تسوية|AJUSTE|AJUSTE|KORREKTUR|RETTIFICA|调整|समायोजन|SIXID
Add|Ongeza|Ajouter|إضافة|Añadir|Adicionar|Hinzufügen|Aggiungi|添加|जोड़ें|Ku dar
Add Product|Ongeza bidhaa|Ajouter un produit|إضافة منتج|Añadir producto|Adicionar produto|Produkt hinzufügen|Aggiungi prodotto|添加商品|उत्पाद जोड़ें|Ku dar badeecad
Add customer|Ongeza mteja|Ajouter un client|إضافة عميل|Añadir cliente|Adicionar cliente|Kunden hinzufügen|Aggiungi cliente|添加客户|ग्राहक जोड़ें|Ku dar macmiil
Added|Imeongezwa|Ajouté|تمت الإضافة|Añadido|Adicionado|Hinzugefügt|Aggiunto|已添加|जोड़ा गया|Lagu daray
Adjustment|Marekebisho|Ajustement|تسوية|Ajuste|Ajuste|Korrektur|Rettifica|调整|समायोजन|Sixid
Adjustments|Marekebisho|Ajustements|تسويات|Ajustes|Ajustes|Korrekturen|Rettifiche|调整|समायोजन|Sixitaanno
Admin|Msimamizi|Administrateur|مسؤول|Administrador|Administrador|Administrator|Amministratore|管理员|व्यवस्थापक|Maamule
All Products|Bidhaa zote|Tous les produits|جميع المنتجات|Todos los productos|Todos os produtos|Alle Produkte|Tutti i prodotti|所有商品|सभी उत्पाद|Dhammaan badeecooyinka
All time|Muda wote|Toute la période|كل الفترات|Todo el período|Todo o período|Gesamter Zeitraum|Tutto il periodo|全部时间|पूरी अवधि|Waqti kasta
Allocate the full total (use Credit for the unpaid part)|Gawa jumla yote (tumia Mkopo kwa sehemu ambayo haijalipwa)|Répartissez le total intégral (utilisez Crédit pour la partie impayée)|وزّع المبلغ الإجمالي بالكامل (استخدم الائتمان للجزء غير المدفوع)|Asigna el total completo (usa Crédito para la parte pendiente)|Distribua o total completo (use Crédito para a parte não paga)|Gesamtbetrag vollständig zuordnen (für den unbezahlten Teil Kredit verwenden)|Ripartisci l'intero totale (usa Credito per la parte non pagata)|分配全部总额（未付部分使用赊账）|पूरी कुल राशि आवंटित करें (बकाया हिस्से के लिए उधार का उपयोग करें)|Qoondee wadarta oo dhan (qaybta aan la bixin u qor Deyn)
Allocated|Imegawiwa|Réparti|تم التوزيع|Asignado|Distribuído|Zugeordnet|Ripartito|已分配|आवंटित|La qoondeeyay
Already exists|Tayari ipo|Existe déjà|موجود بالفعل|Ya existe|Já existe|Bereits vorhanden|Esiste già|已存在|पहले से मौजूद है|Hore ayuu u jiraa
Already received or not sent|Tayari imepokelewa au haijatumwa|Déjà reçu ou non envoyé|تم الاستلام بالفعل أو لم يُرسل|Ya recibido o no enviado|Já recebido ou não enviado|Bereits empfangen oder nicht gesendet|Già ricevuto o non inviato|已接收或未发送|पहले ही प्राप्त या भेजा नहीं गया|Hore loo helay ama lama dirin
Amount|Kiasi|Montant|المبلغ|Importe|Valor|Betrag|Importo|金额|राशि|Lacagta
Amount is more than the outstanding balance|Kiasi kinazidi salio linalodaiwa|Le montant dépasse le solde dû|المبلغ أكبر من الرصيد المستحق|El importe supera el saldo pendiente|O valor excede o saldo devedor|Der Betrag übersteigt den offenen Saldo|L'importo supera il saldo dovuto|金额超过未付余额|राशि बकाया शेष से अधिक है|Lacagtu way ka badan tahay hadhaaga deynta
Authorized adjustment|Marekebisho yaliyoidhinishwa|Ajustement autorisé|تسوية معتمدة|Ajuste autorizado|Ajuste autorizado|Genehmigte Korrektur|Rettifica autorizzata|已授权调整|अधिकृत समायोजन|Sixid la oggolaaday
Auto|Otomatiki|Auto|تلقائي|Auto|Automático|Automatisch|Automatico|自动|स्वचालित|Toos ah
Back|Rudi|Retour|رجوع|Atrás|Voltar|Zurück|Indietro|返回|वापस|Dib
Bank|Benki|Banque|بنك|Banco|Banco|Bank|Banca|银行|बैंक|Bangi
Barcode|Msimbo pau|Code-barres|الرمز الشريطي|Código de barras|Código de barras|Barcode|Codice a barre|条形码|बारकोड|Baar-koodh
Barcode already used by another product|Msimbo pau tayari unatumiwa na bidhaa nyingine|Code-barres déjà utilisé par un autre produit|الرمز الشريطي مستخدم لمنتج آخر|Otro producto ya usa este código de barras|Código de barras já usado por outro produto|Barcode wird bereits für ein anderes Produkt verwendet|Codice a barre già usato da un altro prodotto|条形码已被其他商品使用|बारकोड दूसरे उत्पाद में पहले से उपयोग है|Baar-koodhkan badeecad kale ayaa leh
Barcode not found — add it as a new product|Msimbo pau haujapatikana — uongeze kama bidhaa mpya|Code-barres introuvable — ajoutez-le comme nouveau produit|الرمز الشريطي غير موجود — أضفه كمنتج جديد|Código de barras no encontrado — añádelo como producto nuevo|Código de barras não encontrado — adicione como novo produto|Barcode nicht gefunden — als neues Produkt hinzufügen|Codice a barre non trovato — aggiungilo come nuovo prodotto|未找到条形码 — 请添加为新商品|बारकोड नहीं मिला — इसे नए उत्पाद के रूप में जोड़ें|Baar-koodhka lama helin — ku dar badeecad cusub
Barcode not found — add it in Inventory|Msimbo pau haujapatikana — uongeze kwenye Orodha ya bidhaa|Code-barres introuvable — ajoutez-le dans Stock|الرمز الشريطي غير موجود — أضفه في المخزون|Código de barras no encontrado — añádelo en Inventario|Código de barras não encontrado — adicione no Estoque|Barcode nicht gefunden — im Inventar hinzufügen|Codice a barre non trovato — aggiungilo in Inventario|未找到条形码 — 请在库存中添加|बारकोड नहीं मिला — इसे इन्वेंट्री में जोड़ें|Baar-koodhka lama helin — ku dar Kaydka
Billing|Bili|Facturation|الفوترة|Facturación|Faturação|Abrechnung|Fatturazione|账单|बिलिंग|Biilasha
Brand|Chapa|Marque|العلامة التجارية|Marca|Marca|Marke|Marca|品牌|ब्रांड|Summad
Brands|Chapa|Marques|العلامات التجارية|Marcas|Marcas|Marken|Marche|品牌|ब्रांड|Summado
Buying price|Bei ya kununua|Prix d'achat|سعر الشراء|Precio de compra|Preço de compra|Einkaufspreis|Prezzo d'acquisto|进价|खरीद मूल्य|Qiimaha iibsiga
By payment|Kwa njia ya malipo|Par mode de paiement|حسب طريقة الدفع|Por método de pago|Por forma de pagamento|Nach Zahlungsart|Per metodo di pagamento|按支付方式|भुगतान विधि के अनुसार|Habka lacag-bixinta
CANCELLED|IMEGHAIRIWA|ANNULÉ|ملغى|CANCELADO|CANCELADO|STORNIERT|ANNULLATO|已取消|रद्द|LA JOOJIYAY
CASH HISTORY|HISTORIA YA TASLIMU|HISTORIQUE DE CAISSE|سجل النقد|HISTORIAL DE CAJA|HISTÓRICO DE CAIXA|KASSENVERLAUF|STORICO CASSA|现金记录|नकदी इतिहास|TAARIIKHDA LACAGTA CADDAANKA
CASH IN|TASLIMU ZILIZOINGIA|ENTRÉE DE CAISSE|نقد وارد|ENTRADA DE EFECTIVO|ENTRADA DE CAIXA|BAREINZAHLUNG|ENTRATA DI CASSA|现金收入|नकदी आवक|LACAG SOO GASHAY
CASH OUT|TASLIMU ZILIZOTOKA|SORTIE DE CAISSE|نقد صادر|SALIDA DE EFECTIVO|SAÍDA DE CAIXA|BARAUSZAHLUNG|USCITA DI CASSA|现金支出|नकदी जावक|LACAG BAXDAY
CASH UP|FUNGA HESABU YA TASLIMU|CLÔTURE DE CAISSE|إقفال الصندوق|CIERRE DE CAJA|FECHO DE CAIXA|KASSENABSCHLUSS|CHIUSURA CASSA|现金结账|नकदी मिलान|XISAAB-XIRKA LACAGTA
Camera scanning isn't available on this device. Type the barcode instead.|Kuchanganua kwa kamera hakupatikani kwenye kifaa hiki. Andika msimbo pau badala yake.|Le scan par caméra n'est pas disponible sur cet appareil. Saisissez le code-barres.|المسح بالكاميرا غير متاح على هذا الجهاز. اكتب الرمز الشريطي بدلاً من ذلك.|El escaneo con cámara no está disponible en este dispositivo. Escribe el código de barras.|A leitura pela câmera não está disponível neste dispositivo. Digite o código de barras.|Kamera-Scanning ist auf diesem Gerät nicht verfügbar. Barcode stattdessen eingeben.|La scansione con fotocamera non è disponibile su questo dispositivo. Digita il codice a barre.|此设备不支持相机扫描。请手动输入条形码。|इस डिवाइस पर कैमरे से स्कैन उपलब्ध नहीं है। बारकोड टाइप करें।|Qalabkani kamarad kuma akhrin karo. Qor baar-koodhka.
Cancel|Ghairi|Annuler|إلغاء|Cancelar|Cancelar|Abbrechen|Annulla|取消|रद्द करें|Jooji
Cancelled|Imeghairiwa|Annulé|ملغى|Cancelado|Cancelado|Storniert|Annullato|已取消|रद्द|La joojiyay
Cart|Kikapu|Panier|السلة|Carrito|Carrinho|Warenkorb|Carrello|购物车|कार्ट|Dambiil
Cart is empty|Kikapu ni tupu|Le panier est vide|السلة فارغة|El carrito está vacío|O carrinho está vazio|Warenkorb ist leer|Il carrello è vuoto|购物车为空|कार्ट खाली है|Dambiishu waa madhan tahay
Cash|Taslimu|Espèces|نقد|Efectivo|Dinheiro|Bargeld|Contanti|现金|नकद|Lacag caddaan ah
Cash In|Taslimu zilizoingia|Entrée de caisse|نقد وارد|Entrada de efectivo|Entrada de caixa|Bareinzahlung|Entrata di cassa|现金收入|नकदी आवक|Lacag soo gashay
Cash Out|Taslimu zilizotoka|Sortie de caisse|نقد صادر|Salida de efectivo|Saída de caixa|Barauszahlung|Uscita di cassa|现金支出|नकदी जावक|Lacag baxday
Cash Refunds|Marejesho ya taslimu|Remboursements en espèces|مبالغ مستردة نقدًا|Reembolsos en efectivo|Reembolsos em dinheiro|Barrerückerstattungen|Rimborsi in contanti|现金退款|नकद धनवापसी|Lacag caddaan ah oo la celiyay
Cash Sales|Mauzo ya taslimu|Ventes en espèces|مبيعات نقدية|Ventas en efectivo|Vendas em dinheiro|Barverkäufe|Vendite in contanti|现金销售|नकद बिक्री|Iibka lacagta caddaanka
Cash-up saved|Hesabu ya kufunga taslimu imehifadhiwa|Clôture de caisse enregistrée|تم حفظ إقفال الصندوق|Cierre de caja guardado|Fecho de caixa salvo|Kassenabschluss gespeichert|Chiusura cassa salvata|现金结账已保存|नकदी मिलान सहेजा गया|Xisaab-xirka lacagta waa la kaydiyay
Cashier|Mhudumu wa malipo|Caissier|أمين الصندوق|Cajero|Operador de caixa|Kassierer|Cassiere|收银员|कैशियर|Khasnaji
Categories|Makundi|Catégories|الفئات|Categorías|Categorias|Kategorien|Categorie|分类|श्रेणियाँ|Qaybo
Category|Kundi|Catégorie|الفئة|Categoría|Categoria|Kategorie|Categoria|分类|श्रेणी|Qayb
Choose Cash, M-Pesa or Bank|Chagua Taslimu, M-Pesa au Benki|Choisissez Espèces, M-Pesa ou Banque|اختر نقدًا أو M-Pesa أو بنكًا|Elige Efectivo, M-Pesa o Banco|Escolha Dinheiro, M-Pesa ou Banco|Bargeld, M-Pesa oder Bank wählen|Scegli Contanti, M-Pesa o Banca|选择现金、M-Pesa或银行|नकद, M-Pesa या बैंक चुनें|Dooro lacag caddaan ah, M-Pesa ama Bangi
Choose a destination shop|Chagua duka la kupokea|Choisissez un magasin destinataire|اختر متجر الوجهة|Elige una tienda de destino|Escolha a loja de destino|Zielgeschäft wählen|Scegli il negozio di destinazione|选择目标门店|गंतव्य दुकान चुनें|Dooro dukaanka loo dirayo
Choose items to return|Chagua bidhaa za kurudisha|Choisissez les articles à retourner|اختر الأصناف المراد إرجاعها|Elige los artículos a devolver|Escolha os itens a devolver|Artikel zur Rückgabe wählen|Scegli gli articoli da restituire|选择退货商品|वापस करने वाले आइटम चुनें|Dooro alaabta la celinayo
Close|Funga|Fermer|إغلاق|Cerrar|Fechar|Schließen|Chiudi|关闭|बंद करें|Xir
Confirm|Thibitisha|Confirmer|تأكيد|Confirmar|Confirmar|Bestätigen|Conferma|确认|पुष्टि करें|Xaqiiji
Confirm Return|Thibitisha urejeshaji|Confirmer le retour|تأكيد الإرجاع|Confirmar devolución|Confirmar devolução|Rückgabe bestätigen|Conferma reso|确认退货|वापसी की पुष्टि करें|Xaqiiji celinta
Confirm Sale|Thibitisha mauzo|Confirmer la vente|تأكيد البيع|Confirmar venta|Confirmar venda|Verkauf bestätigen|Conferma vendita|确认销售|बिक्री की पुष्टि करें|Xaqiiji iibka
Continue|Endelea|Continuer|متابعة|Continuar|Continuar|Weiter|Continua|继续|जारी रखें|Sii wad
Cost value|Thamani ya gharama|Valeur au coût|القيمة بالتكلفة|Valor de coste|Valor de custo|Kostenwert|Valore al costo|成本价值|लागत मूल्य|Qiimaha kharashka
Counted cash|Taslimu zilizohesabiwa|Espèces comptées|النقد المعدود|Efectivo contado|Dinheiro contado|Gezähltes Bargeld|Contanti contati|实点现金|गिनी गई नकदी|Lacagta la tiriyay
Counted stock can't be negative|Hesabu ya bidhaa haiwezi kuwa hasi|Le stock compté ne peut pas être négatif|لا يمكن أن يكون المخزون المعدود سالبًا|El stock contado no puede ser negativo|O estoque contado não pode ser negativo|Gezählter Bestand darf nicht negativ sein|La giacenza contata non può essere negativa|实盘库存不能为负数|गिना गया स्टॉक ऋणात्मक नहीं हो सकता|Kaydka la tiriyay kama yaraan karo eber
Counted stock matches the system|Hesabu ya bidhaa inalingana na mfumo|Le stock compté correspond au système|المخزون المعدود يطابق النظام|El stock contado coincide con el sistema|O estoque contado corresponde ao sistema|Gezählter Bestand stimmt mit dem System überein|La giacenza contata corrisponde al sistema|实盘库存与系统一致|गिना गया स्टॉक सिस्टम से मेल खाता है|Kaydka la tiriyay wuxuu waafaqsan yahay nidaamka
Create Transfer|Unda uhamisho|Créer un transfert|إنشاء تحويل|Crear traslado|Criar transferência|Umlagerung erstellen|Crea trasferimento|创建调拨|स्थानांतरण बनाएं|Samee wareejin
Credit|Mkopo|Crédit|ائتمان|Crédito|Crédito|Kredit|Credito|赊账|उधार|Deyn
Credit in favour|Salio kwa manufaa ya mteja|Solde créditeur|رصيد لصالح العميل|Saldo a favor|Saldo a favor|Guthaben|Credito a favore|客户贷方余额|ग्राहक के पक्ष में जमा शेष|Lacag kuu taal
Credit needs a registered customer|Mkopo unahitaji mteja aliyesajiliwa|Le crédit nécessite un client enregistré|الائتمان يتطلب عميلاً مسجلاً|El crédito requiere un cliente registrado|O crédito exige um cliente cadastrado|Kredit erfordert einen registrierten Kunden|Il credito richiede un cliente registrato|赊账需要已注册客户|उधार के लिए पंजीकृत ग्राहक आवश्यक है|Deyntu waxay u baahan tahay macmiil diiwaangashan
Current stock|Stoki ya sasa|Stock actuel|المخزون الحالي|Stock actual|Estoque atual|Aktueller Bestand|Giacenza attuale|当前库存|वर्तमान स्टॉक|Kaydka hadda
Customer|Mteja|Client|عميل|Cliente|Cliente|Kunde|Cliente|客户|ग्राहक|Macmiil
Customer added|Mteja ameongezwa|Client ajouté|تمت إضافة العميل|Cliente añadido|Cliente adicionado|Kunde hinzugefügt|Cliente aggiunto|客户已添加|ग्राहक जोड़ा गया|Macmiil waa lagu daray
Customer credit|Salio la mteja|Avoir client|رصيد العميل الدائن|Crédito del cliente|Crédito do cliente|Kundenguthaben|Credito cliente|客户余额|ग्राहक जमा|Lacagta macmiilka u taal
Customer credit needs a registered customer|Salio la mteja linahitaji mteja aliyesajiliwa|L'avoir client nécessite un client enregistré|رصيد العميل الدائن يتطلب عميلاً مسجلاً|El crédito del cliente requiere un cliente registrado|O crédito do cliente exige um cliente cadastrado|Kundenguthaben erfordert einen registrierten Kunden|Il credito cliente richiede un cliente registrato|客户余额需要已注册客户|ग्राहक जमा के लिए पंजीकृत ग्राहक आवश्यक है|Lacagta macmiilka u taal waxay u baahan tahay macmiil diiwaangashan
Customer debt|Deni la mteja|Dette client|دين العميل|Deuda del cliente|Dívida do cliente|Kundenschulden|Debito cliente|客户欠款|ग्राहक का बकाया|Deynta macmiilka
Customer name|Jina la mteja|Nom du client|اسم العميل|Nombre del cliente|Nome do cliente|Kundenname|Nome cliente|客户姓名|ग्राहक का नाम|Magaca macmiilka
Customer not found|Mteja hajapatikana|Client introuvable|العميل غير موجود|Cliente no encontrado|Cliente não encontrado|Kunde nicht gefunden|Cliente non trovato|未找到客户|ग्राहक नहीं मिला|Macmiilka lama helin
Customers|Wateja|Clients|العملاء|Clientes|Clientes|Kunden|Clienti|客户|ग्राहक|Macaamiisha
Damaged|Imeharibika|Endommagé|تالف|Dañado|Danificado|Beschädigt|Danneggiato|损坏|क्षतिग्रस्त|Dhaawacmay
Debt payment|Malipo ya deni|Règlement de dette|سداد الدين|Pago de deuda|Pagamento de dívida|Schuldentilgung|Pagamento debito|偿还欠款|बकाया भुगतान|Bixinta deynta
Delete|Futa|Supprimer|حذف|Eliminar|Excluir|Löschen|Elimina|删除|हटाएं|Tirtir
Delete this product?|Ufute bidhaa hii?|Supprimer ce produit ?|حذف هذا المنتج؟|¿Eliminar este producto?|Excluir este produto?|Dieses Produkt löschen?|Eliminare questo prodotto?|删除此商品？|यह उत्पाद हटाएं?|Ma tirtiraysaa alaabtan?
Deleted|Imefutwa|Supprimé|تم الحذف|Eliminado|Excluído|Gelöscht|Eliminato|已删除|हटाया गया|La tirtiray
Deleted product|Bidhaa iliyofutwa|Produit supprimé|منتج محذوف|Producto eliminado|Produto excluído|Gelöschtes Produkt|Prodotto eliminato|已删除商品|हटाया गया उत्पाद|Alaab la tirtiray
Difference|Tofauti|Écart|الفرق|Diferencia|Diferença|Differenz|Differenza|差额|अंतर|Farqiga
Discount|Punguzo|Remise|خصم|Descuento|Desconto|Rabatt|Sconto|折扣|छूट|Qiimo-dhimis
Discount can't exceed the subtotal|Punguzo haliwezi kuzidi jumla ndogo|La remise ne peut pas dépasser le sous-total|لا يمكن أن يتجاوز الخصم المجموع الفرعي|El descuento no puede superar el subtotal|O desconto não pode exceder o subtotal|Rabatt darf die Zwischensumme nicht übersteigen|Lo sconto non può superare il subtotale|折扣不能超过小计|छूट उप-योग से अधिक नहीं हो सकती|Qiimo-dhimistu kama badnaan karto wadarta hoose
Enter a customer name|Weka jina la mteja|Saisissez un nom de client|أدخل اسم العميل|Introduce el nombre del cliente|Digite o nome do cliente|Kundennamen eingeben|Inserisci il nome del cliente|输入客户姓名|ग्राहक का नाम दर्ज करें|Geli magaca macmiilka
Enter a name|Weka jina|Saisissez un nom|أدخل اسمًا|Introduce un nombre|Digite um nome|Namen eingeben|Inserisci un nome|输入名称|नाम दर्ज करें|Geli magac
Enter a valid quantity|Weka idadi halali|Saisissez une quantité valide|أدخل كمية صالحة|Introduce una cantidad válida|Digite uma quantidade válida|Gültige Menge eingeben|Inserisci una quantità valida|输入有效数量|मान्य मात्रा दर्ज करें|Geli tiro sax ah
Enter an amount|Weka kiasi|Saisissez un montant|أدخل مبلغًا|Introduce un importe|Digite um valor|Betrag eingeben|Inserisci un importo|输入金额|राशि दर्ज करें|Geli qaddar
Enter the counted cash|Weka taslimu zilizohesabiwa|Saisissez les espèces comptées|أدخل النقد المعدود|Introduce el efectivo contado|Digite o dinheiro contado|Gezähltes Bargeld eingeben|Inserisci i contanti contati|输入实点现金|गिनी गई नकदी दर्ज करें|Geli lacagta caddaanka ah ee la tiriyey
Expected Cash|Taslimu zinazotarajiwa|Espèces attendues|النقد المتوقع|Efectivo esperado|Dinheiro esperado|Erwarteter Kassenbestand|Contanti previsti|应有现金|अपेक्षित नकदी|Lacagta caddaanka ah ee la filayo
Expired|Imeisha muda|Périmé|منتهي الصلاحية|Caducado|Vencido|Abgelaufen|Scaduto|过期|समय-सीमा समाप्त|Dhacay
Fixed amount|Kiasi maalumu|Montant fixe|مبلغ ثابت|Importe fijo|Valor fixo|Fester Betrag|Importo fisso|固定金额|निश्चित राशि|Qaddar go'an
From|Kutoka|De|من|Desde|De|Von|Da|从|से|Ka
Gross profit|Faida ghafi|Bénéfice brut|الربح الإجمالي|Beneficio bruto|Lucro bruto|Bruttogewinn|Utile lordo|毛利|सकल लाभ|Faa'iidada guud
History|Historia|Historique|السجل|Historial|Histórico|Verlauf|Cronologia|历史记录|इतिहास|Taariikhda
Image|Picha|Image|صورة|Imagen|Imagem|Bild|Immagine|图片|छवि|Sawir
Insufficient stock|Stoki haitoshi|Stock insuffisant|المخزون غير كافٍ|Stock insuficiente|Estoque insuficiente|Unzureichender Bestand|Scorte insufficienti|库存不足|अपर्याप्त स्टॉक|Kaydku kuma filna
Inventory|Orodha ya bidhaa|Stock|المخزون|Inventario|Estoque|Inventar|Inventario|库存|इन्वेंट्री|Kaydka
Item not in sale|Bidhaa haipo kwenye mauzo|Article absent de la vente|الصنف غير موجود في عملية البيع|Artículo no incluido en la venta|Item não incluído na venda|Artikel nicht im Verkauf enthalten|Articolo non presente nella vendita|商品不在此销售单中|आइटम इस बिक्री में नहीं है|Alaabtu kuma jirto iibkan
LOW|CHACHE|FAIBLE|منخفض|BAJO|BAIXO|NIEDRIG|BASSO|偏低|कम|YAR
Last 7 days|Siku 7 zilizopita|7 derniers jours|آخر 7 أيام|Últimos 7 días|Últimos 7 dias|Letzte 7 Tage|Ultimi 7 giorni|最近7天|पिछले 7 दिन|7-dii maalmood ee u dambeeyey
Last cash-up|Hesabu ya mwisho ya kufunga taslimu|Dernière clôture de caisse|آخر إقفال للصندوق|Último cierre de caja|Último fecho de caixa|Letzter Kassenabschluss|Ultima chiusura cassa|上次现金结账|पिछला नकदी मिलान|Xisaab-xirkii lacagta ee u dambeeyey
Lost|Imepotea|Perdu|مفقود|Perdido|Perdido|Verloren|Perso|丢失|खोया हुआ|Lumay
Low / Out of Stock|Stoki chache / imeisha|Stock faible / épuisé|مخزون منخفض / نافد|Stock bajo / agotado|Estoque baixo / esgotado|Niedriger Bestand / ausverkauft|Scorte basse / esaurite|库存不足 / 缺货|कम स्टॉक / स्टॉक खत्म|Kayd yar / dhammaaday
Low stock|Stoki chache|Stock faible|مخزون منخفض|Stock bajo|Estoque baixo|Niedriger Bestand|Scorte basse|库存偏低|कम स्टॉक|Kayd yar
Manual entry|Ingiza mwenyewe|Saisie manuelle|إدخال يدوي|Entrada manual|Entrada manual|Manuelle Eingabe|Inserimento manuale|手动输入|मैन्युअल प्रविष्टि|Gelin gacanta ah
Mark received|Weka alama imepokelewa|Marquer comme reçu|وضع علامة تم الاستلام|Marcar como recibido|Marcar como recebido|Als empfangen markieren|Segna come ricevuto|标记为已接收|प्राप्त चिह्नित करें|U calaamadee la helay
Min stock|Kiwango cha chini cha stoki|Stock minimum|الحد الأدنى للمخزون|Stock mínimo|Estoque mínimo|Mindestbestand|Scorta minima|最低库存|न्यूनतम स्टॉक|Kaydka ugu yar
Mixed|Mchanganyiko|Mixte|مختلط|Mixto|Misto|Gemischt|Misto|混合|मिश्रित|Isku dhafan
More details|Maelezo zaidi|Plus de détails|مزيد من التفاصيل|Más detalles|Mais detalhes|Weitere Details|Altri dettagli|更多详情|अधिक विवरण|Faahfaahin dheeraad ah
Movement|Mabadiliko ya stoki|Mouvement|حركة المخزون|Movimiento|Movimentação|Bestandsbewegung|Movimento|库存变动|स्टॉक गतिविधि|Dhaqdhaqaaq
Name is too long|Jina ni refu sana|Le nom est trop long|الاسم طويل جدًا|El nombre es demasiado largo|O nome é muito longo|Name ist zu lang|Il nome è troppo lungo|名称过长|नाम बहुत लंबा है|Magacu aad buu u dheer yahay
Net sales|Mauzo halisi|Ventes nettes|صافي المبيعات|Ventas netas|Vendas líquidas|Nettoumsatz|Vendite nette|净销售额|शुद्ध बिक्री|Iibka saafiga ah
New|Mpya|Nouveau|جديد|Nuevo|Novo|Neu|Nuovo|新建|नया|Cusub
New Transfer|Uhamisho mpya|Nouveau transfert|تحويل جديد|Nuevo traslado|Nova transferência|Neue Umlagerung|Nuovo trasferimento|新建调拨|नया स्थानांतरण|Wareejin cusub
New brand|Chapa mpya|Nouvelle marque|علامة تجارية جديدة|Nueva marca|Nova marca|Neue Marke|Nuova marca|新建品牌|नया ब्रांड|Summad cusub
New category|Kundi jipya|Nouvelle catégorie|فئة جديدة|Nueva categoría|Nova categoria|Neue Kategorie|Nuova categoria|新建分类|नई श्रेणी|Qayb cusub
New customer|Mteja mpya|Nouveau client|عميل جديد|Nuevo cliente|Novo cliente|Neuer Kunde|Nuovo cliente|新建客户|नया ग्राहक|Macmiil cusub
No Customer|Hakuna mteja|Aucun client|لا يوجد عميل|Sin cliente|Sem cliente|Kein Kunde|Nessun cliente|无客户|कोई ग्राहक नहीं|Macmiil ma jiro
No cash records yet|Bado hakuna rekodi za taslimu|Aucune écriture de caisse pour le moment|لا توجد سجلات نقدية بعد|Aún no hay registros de caja|Ainda não há registros de caixa|Noch keine Kasseneinträge|Nessun movimento di cassa|暂无现金记录|अभी कोई नकदी रिकॉर्ड नहीं|Weli ma jiraan diiwaanno lacag caddaan ah
No customers yet|Bado hakuna wateja|Aucun client pour le moment|لا يوجد عملاء بعد|Aún no hay clientes|Ainda não há clientes|Noch keine Kunden|Nessun cliente ancora|暂无客户|अभी कोई ग्राहक नहीं|Weli macaamiil ma jiraan
No matching products|Hakuna bidhaa zinazolingana|Aucun produit correspondant|لا توجد منتجات مطابقة|No hay productos coincidentes|Nenhum produto correspondente|Keine passenden Produkte|Nessun prodotto corrispondente|没有匹配的商品|कोई मेल खाता उत्पाद नहीं|Alaab u dhiganta ma jirto
No movements yet|Bado hakuna mabadiliko ya stoki|Aucun mouvement pour le moment|لا توجد حركات مخزون بعد|Aún no hay movimientos|Ainda não há movimentações|Noch keine Bestandsbewegungen|Nessun movimento ancora|暂无库存变动|अभी कोई स्टॉक गतिविधि नहीं|Weli dhaqdhaqaaqyo ma jiraan
No payments yet|Bado hakuna malipo|Aucun paiement pour le moment|لا توجد مدفوعات بعد|Aún no hay pagos|Ainda não há pagamentos|Noch keine Zahlungen|Nessun pagamento ancora|暂无付款|अभी कोई भुगतान नहीं|Weli lacag-bixinno ma jiraan
No products yet|Bado hakuna bidhaa|Aucun produit pour le moment|لا توجد منتجات بعد|Aún no hay productos|Ainda não há produtos|Noch keine Produkte|Nessun prodotto ancora|暂无商品|अभी कोई उत्पाद नहीं|Weli alaab ma jirto
No products yet. Add products in Inventory.|Bado hakuna bidhaa. Ongeza bidhaa kwenye Orodha ya bidhaa.|Aucun produit pour le moment. Ajoutez des produits dans Stock.|لا توجد منتجات بعد. أضف منتجات في المخزون.|Aún no hay productos. Añade productos en Inventario.|Ainda não há produtos. Adicione produtos no Estoque.|Noch keine Produkte. Produkte im Inventar hinzufügen.|Nessun prodotto ancora. Aggiungi prodotti in Inventario.|暂无商品。请在库存中添加商品。|अभी कोई उत्पाद नहीं। इन्वेंट्री में उत्पाद जोड़ें।|Weli alaab ma jirto. Ku dar alaab Kaydka.
No products yet. Add your first product to start tracking stock.|Bado hakuna bidhaa. Ongeza bidhaa yako ya kwanza kuanza kufuatilia stoki.|Aucun produit pour le moment. Ajoutez votre premier produit pour suivre le stock.|لا توجد منتجات بعد. أضف منتجك الأول لبدء تتبع المخزون.|Aún no hay productos. Añade tu primer producto para empezar a controlar el stock.|Ainda não há produtos. Adicione seu primeiro produto para acompanhar o estoque.|Noch keine Produkte. Erstes Produkt hinzufügen, um den Bestand zu verfolgen.|Nessun prodotto ancora. Aggiungi il primo prodotto per monitorare le scorte.|暂无商品。添加首个商品以开始跟踪库存。|अभी कोई उत्पाद नहीं। स्टॉक ट्रैक करना शुरू करने के लिए पहला उत्पाद जोड़ें।|Weli alaab ma jirto. Ku dar alaabtaada koowaad si aad ula socoto kaydka.
No returns yet|Bado hakuna marejesho|Aucun retour pour le moment|لا توجد مرتجعات بعد|Aún no hay devoluciones|Ainda não há devoluções|Noch keine Rückgaben|Nessun reso ancora|暂无退货|अभी कोई वापसी नहीं|Weli celinno ma jiraan
No sales yet|Bado hakuna mauzo|Aucune vente pour le moment|لا توجد مبيعات بعد|Aún no hay ventas|Ainda não há vendas|Noch keine Verkäufe|Nessuna vendita ancora|暂无销售|अभी कोई बिक्री नहीं|Weli iib ma jiro
No transfers|Hakuna uhamisho|Aucun transfert|لا توجد تحويلات|No hay traslados|Nenhuma transferência|Keine Umlagerungen|Nessun trasferimento|暂无调拨|कोई स्थानांतरण नहीं|Wareejinno ma jiraan
Not enough cash in the drawer|Taslimu kwenye droo hazitoshi|Pas assez d'espèces en caisse|لا يوجد نقد كافٍ في الدرج|No hay suficiente efectivo en la caja|Não há dinheiro suficiente na gaveta|Nicht genug Bargeld in der Kasse|Contanti insufficienti in cassa|钱箱现金不足|दराज में पर्याप्त नकदी नहीं है|Lacagta caddaanka ah ee khaanadda kuma filna
Nothing here yet|Bado hakuna kitu hapa|Rien ici pour le moment|لا يوجد شيء هنا بعد|Aún no hay nada aquí|Ainda não há nada aqui|Hier ist noch nichts|Ancora nulla qui|暂无内容|अभी यहाँ कुछ नहीं है|Weli waxba halkan ma yaallaan
OK|Sawa|OK|حسنًا|Aceptar|OK|OK|OK|确定|ठीक है|Hagaag
OPENING|UFUNGUZI|OUVERTURE|افتتاحي|APERTURA|ABERTURA|ERÖFFNUNG|APERTURA|期初|प्रारंभिक|FURITAAN
OPENING CASH|TASLIMU ZA MWANZO|FONDS DE CAISSE INITIAL|النقد الافتتاحي|EFECTIVO INICIAL|DINHEIRO INICIAL|ANFANGSKASSENBESTAND|CONTANTI INIZIALI|期初现金|प्रारंभिक नकदी|LACAGTA FURITAANKA
OUT|IMETOKA|SORTIE|صادر|SALIDA|SAÍDA|AUSGANG|USCITA|出库|जावक|BAXAY
Opening Cash|Taslimu za mwanzo|Fonds de caisse initial|النقد الافتتاحي|Efectivo inicial|Dinheiro inicial|Anfangskassenbestand|Contanti iniziali|期初现金|प्रारंभिक नकदी|Lacagta furitaanka
Original|Asili|Original|الأصل|Original|Original|Original|Originale|原始|मूल|Asalka
Other|Nyingine|Autre|أخرى|Otro|Outro|Sonstiges|Altro|其他|अन्य|Kale
Out of stock|Stoki imeisha|Rupture de stock|نفد المخزون|Agotado|Esgotado|Ausverkauft|Esaurito|缺货|स्टॉक खत्म|Kaydku wuu dhammaaday
Outstanding|Haijalipwa|Impayé|مستحق|Pendiente de pago|Por pagar|Offen|Da pagare|未付|बकाया|Aan la bixin
Outstanding balance|Salio linalodaiwa|Solde dû|الرصيد المستحق|Saldo pendiente|Saldo devedor|Offener Saldo|Saldo dovuto|未付余额|बकाया शेष|Haraaga aan la bixin
Over by|Ziada ya|Excédent de|زيادة بمقدار|Exceso de|Excedente de|Überschuss von|Eccedenza di|多出|अधिक राशि|Ku dheeraad ah
Overview|Muhtasari|Vue d'ensemble|نظرة عامة|Resumen|Visão geral|Übersicht|Panoramica|概览|अवलोकन|Dulmar
Own use|Matumizi binafsi|Usage personnel|استخدام شخصي|Uso propio|Uso próprio|Eigenverbrauch|Uso personale|自用|निजी उपयोग|Isticmaal shakhsi ah
PENDING|INASUBIRI|EN ATTENTE|قيد الانتظار|PENDIENTE|PENDENTE|AUSSTEHEND|IN ATTESA|待处理|लंबित|SUGAYA
PURCHASE|UNUNUZI|ACHAT|شراء|COMPRA|COMPRA|EINKAUF|ACQUISTO|采购|खरीद|IIBSI
Payment|Malipo|Paiement|دفعة|Pago|Pagamento|Zahlung|Pagamento|付款|भुगतान|Lacag-bixin
Payment amounts can't be negative|Kiasi cha malipo hakiwezi kuwa hasi|Les montants des paiements ne peuvent pas être négatifs|لا يمكن أن تكون مبالغ الدفع سالبة|Los importes de pago no pueden ser negativos|Os valores de pagamento não podem ser negativos|Zahlungsbeträge dürfen nicht negativ sein|Gli importi dei pagamenti non possono essere negativi|付款金额不能为负数|भुगतान राशि ऋणात्मक नहीं हो सकती|Qaddarrada lacag-bixintu kama yaraan karaan eber
Payment received|Malipo yamepokelewa|Paiement reçu|تم استلام الدفعة|Pago recibido|Pagamento recebido|Zahlung erhalten|Pagamento ricevuto|已收款|भुगतान प्राप्त|Lacagta waa la helay
Payments|Malipo|Paiements|المدفوعات|Pagos|Pagamentos|Zahlungen|Pagamenti|付款|भुगतान|Lacag-bixinnada
Payments exceed the total|Malipo yanazidi jumla|Les paiements dépassent le total|المدفوعات تتجاوز الإجمالي|Los pagos superan el total|Os pagamentos excedem o total|Zahlungen übersteigen den Gesamtbetrag|I pagamenti superano il totale|付款超过总额|भुगतान कुल राशि से अधिक है|Lacag-bixinnadu waxay ka badan yihiin wadarta
Pending|Inasubiri|En attente|قيد الانتظار|Pendiente|Pendente|Ausstehend|In attesa|待处理|लंबित|Sugaya
Percentage|Asilimia|Pourcentage|نسبة مئوية|Porcentaje|Percentagem|Prozentsatz|Percentuale|百分比|प्रतिशत|Boqolkiiba
Performance|Utendaji|Performance|الأداء|Rendimiento|Desempenho|Leistung|Prestazioni|业绩|प्रदर्शन|Waxqabad
Performed by|Imefanywa na|Effectué par|نفّذه|Realizado por|Realizado por|Durchgeführt von|Eseguito da|操作人|द्वारा किया गया|Waxaa sameeyay
Phone|Simu|Téléphone|الهاتف|Teléfono|Telefone|Telefon|Telefono|电话|फ़ोन|Telefoon
Physical count|Hesabu halisi|Comptage physique|الجرد الفعلي|Conteo físico|Contagem física|Istzählung|Conteggio fisico|实盘数量|वास्तविक गिनती|Tirinta dhabta ah
Physical stock count|Hesabu halisi ya stoki|Inventaire physique|الجرد الفعلي للمخزون|Conteo físico de existencias|Contagem física do estoque|Physische Bestandszählung|Inventario fisico|实物库存盘点|वास्तविक स्टॉक गणना|Tirinta kaydka dhabta ah
Potential profit|Faida inayowezekana|Bénéfice potentiel|الربح المحتمل|Beneficio potencial|Lucro potencial|Potenzieller Gewinn|Utile potenziale|潜在利润|संभावित लाभ|Faa'iidada la filayo
Previous|Iliyotangulia|Précédent|السابق|Anterior|Anterior|Zurück|Precedente|上一个|पिछला|Hore
Prices and quantity can't be negative|Bei na idadi haziwezi kuwa hasi|Les prix et la quantité ne peuvent pas être négatifs|لا يمكن أن تكون الأسعار والكمية سالبة|Los precios y la cantidad no pueden ser negativos|Os preços e a quantidade não podem ser negativos|Preise und Menge dürfen nicht negativ sein|Prezzi e quantità non possono essere negativi|价格和数量不能为负数|कीमतें और मात्रा ऋणात्मक नहीं हो सकतीं|Qiimaha iyo tiradu kama yaraan karaan eber
Print|Chapisha|Imprimer|طباعة|Imprimir|Imprimir|Drucken|Stampa|打印|प्रिंट करें|Daabac
Product|Bidhaa|Produit|منتج|Producto|Produto|Produkt|Prodotto|商品|उत्पाद|Alaab
Product added|Bidhaa imeongezwa|Produit ajouté|تمت إضافة المنتج|Producto añadido|Produto adicionado|Produkt hinzugefügt|Prodotto aggiunto|商品已添加|उत्पाद जोड़ा गया|Alaab lagu daray
Product has an open transfer|Bidhaa ina uhamisho ambao haujakamilika|Le produit a un transfert en cours|للمنتج تحويل غير مكتمل|El producto tiene un traslado abierto|O produto tem uma transferência em aberto|Produkt hat eine offene Umlagerung|Il prodotto ha un trasferimento aperto|商品有未完成的调拨|उत्पाद का एक स्थानांतरण लंबित है|Alaabtu waxay leedahay wareejin furan
Product name|Jina la bidhaa|Nom du produit|اسم المنتج|Nombre del producto|Nome do produto|Produktname|Nome prodotto|商品名称|उत्पाद का नाम|Magaca alaabta
Product name is required|Jina la bidhaa linahitajika|Le nom du produit est requis|اسم المنتج مطلوب|Se requiere el nombre del producto|O nome do produto é obrigatório|Produktname ist erforderlich|Il nome del prodotto è obbligatorio|必须填写商品名称|उत्पाद का नाम आवश्यक है|Magaca alaabta waa loo baahan yahay
Product not found|Bidhaa haijapatikana|Produit introuvable|المنتج غير موجود|Producto no encontrado|Produto não encontrado|Produkt nicht gefunden|Prodotto non trovato|未找到商品|उत्पाद नहीं मिला|Alaabta lama helin
Products|Bidhaa|Produits|المنتجات|Productos|Produtos|Produkte|Prodotti|商品|उत्पाद|Alaabo
Purchase|Ununuzi|Achat|شراء|Compra|Compra|Einkauf|Acquisto|采购|खरीद|Iibsi
Quantity|Idadi|Quantité|الكمية|Cantidad|Quantidade|Menge|Quantità|数量|मात्रा|Tirada
Quantity changes only through Stock In, Stock Out, Adjustments, sales and purchases.|Idadi hubadilika tu kupitia Stoki zinazoingia, Stoki zinazotoka, Marekebisho, mauzo na manunuzi.|La quantité ne change que via les entrées de stock, sorties de stock, ajustements, ventes et achats.|تتغير الكمية فقط عبر إدخال المخزون وإخراج المخزون والتسويات والمبيعات والمشتريات.|La cantidad solo cambia mediante entradas de stock, salidas de stock, ajustes, ventas y compras.|A quantidade só muda por entradas de estoque, saídas de estoque, ajustes, vendas e compras.|Die Menge ändert sich nur durch Wareneingänge, Warenausgänge, Korrekturen, Verkäufe und Einkäufe.|La quantità cambia solo tramite carichi, scarichi, rettifiche, vendite e acquisti.|数量仅通过入库、出库、调整、销售和采购变更。|मात्रा केवल स्टॉक आवक, स्टॉक जावक, समायोजन, बिक्री और खरीद से बदलती है।|Tiradu waxay ku beddelantaa oo keliya kayd soo gala, kayd baxa, sixitaanno, iib iyo iibsi.
Quantity must be more than 0|Idadi lazima iwe zaidi ya 0|La quantité doit être supérieure à 0|يجب أن تكون الكمية أكبر من 0|La cantidad debe ser mayor que 0|A quantidade deve ser maior que 0|Menge muss größer als 0 sein|La quantità deve essere maggiore di 0|数量必须大于0|मात्रा 0 से अधिक होनी चाहिए|Tiradu waa inay ka badan tahay 0
RECEIVED|IMEPOKELEWA|REÇU|تم الاستلام|RECIBIDO|RECEBIDO|EMPFANGEN|RICEVUTO|已接收|प्राप्त|LA HELAY
RETURN|MAREJESHO|RETOUR|إرجاع|DEVOLUCIÓN|DEVOLUÇÃO|RÜCKGABE|RESO|退货|वापसी|CELIN
Reason|Sababu|Motif|السبب|Motivo|Motivo|Grund|Motivo|原因|कारण|Sabab
Receipt|Risiti|Reçu|إيصال|Recibo|Recibo|Beleg|Ricevuta|收据|रसीद|Rasiid
Receipt copied|Risiti imenakiliwa|Reçu copié|تم نسخ الإيصال|Recibo copiado|Recibo copiado|Beleg kopiert|Ricevuta copiata|收据已复制|रसीद कॉपी की गई|Rasiidka waa la koobiyeeyay
Receive|Pokea|Recevoir|استلام|Recibir|Receber|Empfangen|Ricevi|接收|प्राप्त करें|Qaado
Received|Imepokelewa|Reçu|تم الاستلام|Recibido|Recebido|Empfangen|Ricevuto|已接收|प्राप्त|La helay
Recent Adjustments|Marekebisho ya karibuni|Ajustements récents|التسويات الأخيرة|Ajustes recientes|Ajustes recentes|Letzte Korrekturen|Rettifiche recenti|最近调整|हाल के समायोजन|Sixitaannadii u dambeeyay
Recent Stock In|Stoki zilizoingia karibuni|Entrées de stock récentes|إدخالات المخزون الأخيرة|Entradas de stock recientes|Entradas de estoque recentes|Letzte Wareneingänge|Carichi recenti|最近入库|हाल की स्टॉक आवक|Kaydkii u dambeeyay ee soo galay
Recent Stock Out|Stoki zilizotoka karibuni|Sorties de stock récentes|إخراجات المخزون الأخيرة|Salidas de stock recientes|Saídas de estoque recentes|Letzte Warenausgänge|Scarichi recenti|最近出库|हाल की स्टॉक जावक|Kaydkii u dambeeyay ee baxay
Recent sales|Mauzo ya karibuni|Ventes récentes|المبيعات الأخيرة|Ventas recientes|Vendas recentes|Letzte Verkäufe|Vendite recenti|最近销售|हाल की बिक्री|Iibkii u dambeeyay
Recorded|Imerekodiwa|Enregistré|تم التسجيل|Registrado|Registrado|Erfasst|Registrato|已记录|दर्ज किया गया|La diiwaangeliyay
Refund|Rejesha fedha|Remboursement|استرداد المبلغ|Reembolso|Reembolso|Rückerstattung|Rimborso|退款|धनवापसी|Lacag celin
Refund as|Rejesha fedha kama|Rembourser sous forme de|الاسترداد على شكل|Reembolsar como|Reembolsar como|Erstatten als|Rimborsa come|退款方式|धनवापसी का तरीका|Ku celi lacagta qaab
Remaining|Iliyobaki|Restant|المتبقي|Restante|Restante|Verbleibend|Rimanente|剩余|शेष|Inta hartay
Remove|Ondoa|Retirer|إزالة|Quitar|Remover|Entfernen|Rimuovi|移除|निकालें|Ka saar
Reports|Ripoti|Rapports|التقارير|Informes|Relatórios|Berichte|Report|报表|रिपोर्ट|Warbixinno
Reprint|Chapisha tena|Réimprimer|إعادة الطباعة|Reimprimir|Reimprimir|Erneut drucken|Ristampa|重新打印|फिर प्रिंट करें|Dib u daabac
Rest|Salio|Reste|الباقي|Resto|Restante|Rest|Resto|余下|बाकी|Inta kale
Return|Rudisha|Retour|إرجاع|Devolución|Devolução|Rückgabe|Reso|退货|वापसी|Celi
Return items|Rudisha bidhaa|Retourner des articles|إرجاع الأصناف|Devolver artículos|Devolver itens|Artikel zurückgeben|Restituisci articoli|退回商品|आइटम वापस करें|Celi alaabta
Return recorded|Marejesho yamerekodiwa|Retour enregistré|تم تسجيل الإرجاع|Devolución registrada|Devolução registrada|Rückgabe erfasst|Reso registrato|退货已记录|वापसी दर्ज की गई|Celinta waa la diiwaangeliyay
Returned|Imerudishwa|Retourné|تم الإرجاع|Devuelto|Devolvido|Zurückgegeben|Restituito|已退货|वापस किया गया|La celiyay
Returns today|Marejesho ya leo|Retours du jour|مرتجعات اليوم|Devoluciones de hoy|Devoluções de hoje|Heutige Rückgaben|Resi di oggi|今日退货|आज की वापसी|Celinta maanta
SALE|MAUZO|VENTE|بيع|VENTA|VENDA|VERKAUF|VENDITA|销售|बिक्री|IIB
SCAN|CHANGANUA|SCANNER|مسح|ESCANEAR|LER CÓDIGO|SCANNEN|SCANSIONA|扫描|स्कैन करें|ISKAAN GAREE
SENT|IMETUMWA|ENVOYÉ|تم الإرسال|ENVIADO|ENVIADO|GESENDET|INVIATO|已发送|भेजा गया|LA DIRAY
SKU|SKU|SKU|SKU|SKU|SKU|SKU|SKU|SKU|SKU|SKU
SKU already used|SKU tayari inatumika|SKU déjà utilisé|SKU مستخدم بالفعل|SKU ya utilizado|SKU já usado|SKU bereits verwendet|SKU già usato|SKU已被使用|SKU पहले से उपयोग में है|SKU horay loo isticmaalay
STOCK IN|STOKI ZINAZOINGIA|ENTRÉE DE STOCK|إدخال مخزون|ENTRADA DE STOCK|ENTRADA DE ESTOQUE|WARENEINGANG|CARICO MAGAZZINO|入库|स्टॉक आवक|KAYD SOO GALAY
STOCK OUT|STOKI ZINAZOTOKA|SORTIE DE STOCK|إخراج مخزون|SALIDA DE STOCK|SAÍDA DE ESTOQUE|WARENAUSGANG|SCARICO MAGAZZINO|出库|स्टॉक जावक|KAYD BAXAY
Sale completed|Mauzo yamekamilika|Vente terminée|اكتمل البيع|Venta completada|Venda concluída|Verkauf abgeschlossen|Vendita completata|销售已完成|बिक्री पूर्ण|Iibka waa la dhammeeyay
Sale not found|Mauzo hayajapatikana|Vente introuvable|عملية البيع غير موجودة|Venta no encontrada|Venda não encontrada|Verkauf nicht gefunden|Vendita non trovata|未找到销售记录|बिक्री नहीं मिली|Iibka lama helin
Sales|Mauzo|Ventes|المبيعات|Ventas|Vendas|Verkäufe|Vendite|销售|बिक्री|Iibka
Save|Hifadhi|Enregistrer|حفظ|Guardar|Salvar|Speichern|Salva|保存|सहेजें|Kaydi
Saved|Imehifadhiwa|Enregistré|تم الحفظ|Guardado|Salvo|Gespeichert|Salvato|已保存|सहेजा गया|La kaydiyay
Scan barcode|Changanua msimbo pau|Scanner le code-barres|مسح الرمز الشريطي|Escanear código de barras|Ler código de barras|Barcode scannen|Scansiona codice a barre|扫描条形码|बारकोड स्कैन करें|Iskaan garee koodhka alaabta
Search product...|Tafuta bidhaa...|Rechercher un produit...|ابحث عن منتج...|Buscar producto...|Buscar produto...|Produkt suchen...|Cerca prodotto...|搜索商品...|उत्पाद खोजें...|Raadi alaab...
Select a product|Chagua bidhaa|Sélectionnez un produit|اختر منتجًا|Selecciona un producto|Selecione um produto|Ein Produkt auswählen|Seleziona un prodotto|选择一个商品|एक उत्पाद चुनें|Dooro alaab
Select product|Chagua bidhaa|Sélectionner un produit|اختيار منتج|Seleccionar producto|Selecionar produto|Produkt auswählen|Seleziona prodotto|选择商品|उत्पाद चुनें|Dooro alaab
Sell|Uza|Vendre|بيع|Vender|Vender|Verkaufen|Vendi|出售|बेचें|Iibi
Sell value|Thamani ya mauzo|Valeur de vente|قيمة البيع|Valor de venta|Valor de venda|Verkaufswert|Valore di vendita|销售价值|बिक्री मूल्य|Qiimaha iibka
Selling price|Bei ya kuuza|Prix de vente|سعر البيع|Precio de venta|Preço de venda|Verkaufspreis|Prezzo di vendita|售价|विक्रय मूल्य|Qiimaha iibinta
Selling value|Thamani ya mauzo|Valeur de vente|قيمة البيع|Valor de venta|Valor de venda|Verkaufswert|Valore di vendita|销售价值|बिक्री मूल्य|Qiimaha iibinta
Send|Tuma|Envoyer|إرسال|Enviar|Enviar|Senden|Invia|发送|भेजें|Dir
Sent|Imetumwa|Envoyé|تم الإرسال|Enviado|Enviado|Gesendet|Inviato|已发送|भेजा गया|La diray
Share|Shiriki|Partager|مشاركة|Compartir|Compartilhar|Teilen|Condividi|分享|साझा करें|La wadaag
Source|Chanzo|Source|المصدر|Origen|Origem|Quelle|Origine|来源|स्रोत|Isha
Status|Hali|Statut|الحالة|Estado|Estado|Status|Stato|状态|स्थिति|Xaaladda
Stock|Stoki|Stock|المخزون|Stock|Estoque|Bestand|Scorte|库存|स्टॉक|Kaydka
Stock In|Stoki zinazoingia|Entrée de stock|إدخال مخزون|Entrada de stock|Entrada de estoque|Wareneingang|Carico magazzino|入库|स्टॉक आवक|Kayd soo galay
Stock Levels|Viwango vya stoki|Niveaux de stock|مستويات المخزون|Niveles de stock|Níveis de estoque|Bestandsmengen|Livelli di scorta|库存水平|स्टॉक स्तर|Heerarka kaydka
Stock Out|Stoki zinazotoka|Sortie de stock|إخراج مخزون|Salida de stock|Saída de estoque|Warenausgang|Scarico magazzino|出库|स्टॉक जावक|Kayd baxay
Stock Report|Ripoti ya stoki|Rapport de stock|تقرير المخزون|Informe de stock|Relatório de estoque|Bestandsbericht|Report scorte|库存报表|स्टॉक रिपोर्ट|Warbixinta kaydka
Stock value|Thamani ya stoki|Valeur du stock|قيمة المخزون|Valor del stock|Valor do estoque|Bestandswert|Valore delle scorte|库存价值|स्टॉक मूल्य|Qiimaha kaydka
Subtotal|Jumla ndogo|Sous-total|المجموع الفرعي|Subtotal|Subtotal|Zwischensumme|Subtotale|小计|उप-योग|Wadar-hoosaad
TOTAL|JUMLA|TOTAL|الإجمالي|TOTAL|TOTAL|GESAMT|TOTALE|总计|कुल|WADARTA
TRANSFER CANCEL|KUGHAIRI UHAMISHO|ANNULATION DE TRANSFERT|إلغاء تحويل|CANCELACIÓN DE TRASLADO|CANCELAMENTO DE TRANSFERÊNCIA|UMLAGERUNGSSTORNO|ANNULLAMENTO TRASFERIMENTO|调拨取消|स्थानांतरण रद्द|JOOJINTA WAREEJINTA
TRANSFER IN|UHAMISHO UNAOINGIA|TRANSFERT ENTRANT|تحويل وارد|TRASLADO ENTRANTE|TRANSFERÊNCIA DE ENTRADA|UMLAGERUNGSEINGANG|TRASFERIMENTO IN ENTRATA|调拨入库|स्थानांतरण आवक|WAREEJIN SOO GASHAY
TRANSFER OUT|UHAMISHO UNAOTOKA|TRANSFERT SORTANT|تحويل صادر|TRASLADO SALIENTE|TRANSFERÊNCIA DE SAÍDA|UMLAGERUNGSAUSGANG|TRASFERIMENTO IN USCITA|调拨出库|स्थानांतरण जावक|WAREEJIN BAXAYSA
Thank you!|Asante!|Merci !|شكرًا لك!|¡Gracias!|Obrigado!|Vielen Dank!|Grazie!|谢谢！|धन्यवाद!|Mahadsanid!
Till|Kasha la malipo|Caisse|صندوق النقد|Caja|Caixa|Kasse|Cassa|收银台|कैश काउंटर|Khasnad
To return items, open the original sale in Sales and tap Return items.|Ili kurudisha bidhaa, fungua mauzo ya awali kwenye Mauzo na uguse Rudisha bidhaa.|Pour retourner des articles, ouvrez la vente d'origine dans Ventes et appuyez sur Retourner des articles.|لإرجاع الأصناف، افتح عملية البيع الأصلية في المبيعات واضغط على إرجاع الأصناف.|Para devolver artículos, abre la venta original en Ventas y toca Devolver artículos.|Para devolver itens, abra a venda original em Vendas e toque em Devolver itens.|Zum Zurückgeben von Artikeln den ursprünglichen Verkauf unter Verkäufe öffnen und auf Artikel zurückgeben tippen.|Per restituire articoli, apri la vendita originale in Vendite e tocca Restituisci articoli.|如需退货，请在销售中打开原销售单，然后点击退回商品。|आइटम वापस करने के लिए बिक्री में मूल बिक्री खोलें और आइटम वापस करें पर टैप करें।|Si aad alaab u celiso, ka fur iibkii asalka ahaa qaybta Iibka, taabo Celi alaabta.
To shop / branch|Kwenda duka / tawi|Vers magasin / succursale|إلى المتجر / الفرع|A tienda / sucursal|Para loja / filial|An Geschäft / Filiale|Al negozio / filiale|目标门店 / 分店|गंतव्य दुकान / शाखा|Ku socota dukaan / laan
Today|Leo|Aujourd'hui|اليوم|Hoy|Hoje|Heute|Oggi|今天|आज|Maanta
Today's sales|Mauzo ya leo|Ventes du jour|مبيعات اليوم|Ventas de hoy|Vendas de hoje|Heutige Verkäufe|Vendite di oggi|今日销售|आज की बिक्री|Iibka maanta
Top products|Bidhaa zinazouzwa zaidi|Meilleures ventes|المنتجات الأكثر مبيعًا|Productos más vendidos|Produtos mais vendidos|Meistverkaufte Produkte|Prodotti più venduti|热销商品|सबसे अधिक बिकने वाले उत्पाद|Alaabta ugu iibka badan
Transactions|Miamala|Transactions|المعاملات|Transacciones|Transações|Transaktionen|Transazioni|交易|लेनदेन|Macaamillada
Transfer can't be cancelled|Uhamisho hauwezi kughairiwa|Le transfert ne peut pas être annulé|لا يمكن إلغاء التحويل|No se puede cancelar el traslado|Não é possível cancelar a transferência|Umlagerung kann nicht storniert werden|Impossibile annullare il trasferimento|无法取消调拨|स्थानांतरण रद्द नहीं किया जा सकता|Wareejinta lama joojin karo
Transfer can't be sent|Uhamisho hauwezi kutumwa|Le transfert ne peut pas être envoyé|لا يمكن إرسال التحويل|No se puede enviar el traslado|Não é possível enviar a transferência|Umlagerung kann nicht gesendet werden|Impossibile inviare il trasferimento|无法发送调拨|स्थानांतरण भेजा नहीं जा सकता|Wareejinta lama diri karo
Transfer created|Uhamisho umeundwa|Transfert créé|تم إنشاء التحويل|Traslado creado|Transferência criada|Umlagerung erstellt|Trasferimento creato|调拨已创建|स्थानांतरण बनाया गया|Wareejin la sameeyay
Transfers|Uhamisho|Transferts|التحويلات|Traslados|Transferências|Umlagerungen|Trasferimenti|调拨|स्थानांतरण|Wareejinnada
Unit|Kipimo|Unité|الوحدة|Unidad|Unidade|Einheit|Unità|单位|इकाई|Halbeeg
Valuation|Uthamini|Valorisation|تقييم المخزون|Valoración|Avaliação|Bewertung|Valutazione|估值|मूल्यांकन|Qiimayn
credit|mkopo|crédit|ائتمان|crédito|crédito|Kredit|credito|赊账|उधार|deyn
left|imebaki|restant|متبقٍ|restante|restante|übrig|rimanente|剩余|बाकी|haray
out|imetoka|sortie|صادر|salida|saída|Ausgang|uscita|出库|जावक|baxay
pcs|vipande|pièces|قطع|uds.|unid.|Stk.|pz|件|नग|xabbo
AI Reorder|Kuagiza tena kwa AI|Réapprovisionnement IA|إعادة الطلب بالذكاء الاصطناعي|Reposición con IA|Reposição com IA|KI-Nachbestellung|Riordino IA|AI补货|AI पुनः ऑर्डर|Dib-u-dalbashada AI
Shop data|Data za duka|Données du magasin|بيانات المتجر|Datos de la tienda|Dados da loja|Shopdaten|Dati del negozio|门店数据|दुकान का डेटा|Xogta dukaanka
Manual data|Data za kuingiza mwenyewe|Données manuelles|بيانات يدوية|Datos manuales|Dados manuais|Manuelle Daten|Dati manuali|手动数据|मैन्युअल डेटा|Xog gacanta lagu geliyay
Units sold|Vipande vilivyouzwa|Unités vendues|الوحدات المباعة|Unidades vendidas|Unidades vendidas|Verkaufte Einheiten|Unità vendute|已售数量|बेची गई इकाइयाँ|Tirada la iibiyay
Stock on hand|Stoki iliyopo|Stock disponible|المخزون المتاح|Stock disponible|Estoque disponível|Verfügbarer Bestand|Giacenza disponibile|现有库存|उपलब्ध स्टॉक|Kaydka yaalla
Incoming stock|Stoki inayokuja|Stock à recevoir|مخزون قادم|Stock entrante|Estoque a receber|Erwarteter Wareneingang|Scorte in arrivo|待入库库存|आने वाला स्टॉक|Kaydka soo socda
Sales period (days)|Kipindi cha mauzo (siku)|Période de vente (jours)|فترة المبيعات (أيام)|Período de ventas (días)|Período de vendas (dias)|Verkaufszeitraum (Tage)|Periodo di vendita (giorni)|销售周期（天）|बिक्री अवधि (दिन)|Muddada iibka (maalmo)
Supplier lead time (days)|Muda wa kusubiri msambazaji (siku)|Délai fournisseur (jours)|مهلة توريد المورد (أيام)|Plazo del proveedor (días)|Prazo do fornecedor (dias)|Lieferzeit des Lieferanten (Tage)|Tempo di consegna fornitore (giorni)|供应商交货期（天）|आपूर्तिकर्ता की आपूर्ति अवधि (दिन)|Muddada keenista alaab-qeybiyaha (maalmo)
Stock cover (days)|Muda ambao stoki inatosha (siku)|Couverture de stock (jours)|تغطية المخزون (أيام)|Cobertura de stock (días)|Cobertura de estoque (dias)|Bestandsreichweite (Tage)|Copertura scorte (giorni)|库存可用天数（天）|स्टॉक पर्याप्तता (दिन)|Muddada kaydku ku filan yahay (maalmo)
Safety stock (days)|Stoki ya akiba (siku)|Stock de sécurité (jours)|مخزون الأمان (أيام)|Stock de seguridad (días)|Estoque de segurança (dias)|Sicherheitsbestand (Tage)|Scorta di sicurezza (giorni)|安全库存（天）|सुरक्षा स्टॉक (दिन)|Kaydka badbaadada (maalmo)
Use shop data|Tumia data za duka|Utiliser les données du magasin|استخدام بيانات المتجر|Usar datos de la tienda|Usar dados da loja|Shopdaten verwenden|Usa i dati del negozio|使用门店数据|दुकान का डेटा उपयोग करें|Adeegso xogta dukaanka
Add row|Ongeza safu mlalo|Ajouter une ligne|إضافة صف|Añadir fila|Adicionar linha|Zeile hinzufügen|Aggiungi riga|添加行|पंक्ति जोड़ें|Ku dar saf
Recommend reorder|Pendekeza kuagiza tena|Recommander un réapprovisionnement|اقتراح إعادة الطلب|Recomendar reposición|Recomendar reposição|Nachbestellung empfehlen|Consiglia riordino|推荐补货|पुनः ऑर्डर का सुझाव दें|Soo jeedi dib-u-dalab
Analyzing stock…|Inachambua stoki…|Analyse du stock…|جارٍ تحليل المخزون…|Analizando stock…|Analisando estoque…|Bestand wird analysiert…|Analisi scorte…|正在分析库存…|स्टॉक का विश्लेषण हो रहा है…|Kaydka ayaa la falanqaynayaa…
Stop|Simamisha|Arrêter|إيقاف|Detener|Parar|Stoppen|Interrompi|停止|रोकें|Jooji
Suggested quantity|Idadi iliyopendekezwa|Quantité suggérée|الكمية المقترحة|Cantidad sugerida|Quantidade sugerida|Empfohlene Menge|Quantità suggerita|建议数量|सुझाई गई मात्रा|Tirada la soo jeediyay
Estimated cost|Gharama iliyokadiriwa|Coût estimé|التكلفة التقديرية|Coste estimado|Custo estimado|Geschätzte Kosten|Costo stimato|预计成本|अनुमानित लागत|Kharashka la qiyaasay
Download CSV|Pakua CSV|Télécharger le CSV|تنزيل CSV|Descargar CSV|Baixar CSV|CSV herunterladen|Scarica CSV|下载CSV|CSV डाउनलोड करें|Soo dejiso CSV
Review recommendations before ordering. No stock or purchases are changed.|Kagua mapendekezo kabla ya kuagiza. Hakuna stoki wala manunuzi yatakayobadilishwa.|Vérifiez les recommandations avant de commander. Aucun stock ni achat n'est modifié.|راجع التوصيات قبل الطلب. لا يتم تغيير أي مخزون أو مشتريات.|Revisa las recomendaciones antes de pedir. No se modifica el stock ni las compras.|Revise as recomendações antes de encomendar. Nenhum estoque ou compra é alterado.|Empfehlungen vor der Bestellung prüfen. Bestände und Einkäufe werden nicht geändert.|Controlla i consigli prima di ordinare. Scorte e acquisti non vengono modificati.|下单前请审核建议。不会更改任何库存或采购记录。|ऑर्डर देने से पहले सुझावों की समीक्षा करें। स्टॉक या खरीद में कोई बदलाव नहीं होता।|Hubi talooyinka ka hor dalbashada. Kaydka iyo wax iibsiga midna lama beddelayo.
Sales and stock data will be sent to Lovable AI when you request recommendations.|Data za mauzo na stoki zitatumwa kwa Lovable AI unapoomba mapendekezo.|Les données de vente et de stock seront envoyées à Lovable AI lorsque vous demanderez des recommandations.|ستُرسل بيانات المبيعات والمخزون إلى Lovable AI عند طلب التوصيات.|Los datos de ventas y stock se enviarán a Lovable AI cuando solicites recomendaciones.|Os dados de vendas e estoque serão enviados ao Lovable AI quando solicitar recomendações.|Verkaufs- und Bestandsdaten werden an Lovable AI gesendet, wenn Sie Empfehlungen anfordern.|I dati di vendita e delle scorte saranno inviati a Lovable AI quando richiedi consigli.|请求建议时，销售和库存数据将发送至Lovable AI。|सुझाव माँगने पर बिक्री और स्टॉक डेटा Lovable AI को भेजा जाएगा।|Xogta iibka iyo kaydka waxaa loo diri doonaa Lovable AI markaad talooyin codsato.
Enter at least one product|Weka angalau bidhaa moja|Saisissez au moins un produit|أدخل منتجًا واحدًا على الأقل|Introduce al menos un producto|Digite pelo menos um produto|Mindestens ein Produkt eingeben|Inserisci almeno un prodotto|至少输入一个商品|कम से कम एक उत्पाद दर्ज करें|Geli ugu yaraan hal alaab
Enter valid non-negative quantities|Weka idadi halali zisizo hasi|Saisissez des quantités valides non négatives|أدخل كميات صالحة غير سالبة|Introduce cantidades válidas no negativas|Digite quantidades válidas não negativas|Gültige, nicht negative Mengen eingeben|Inserisci quantità valide non negative|输入有效的非负数量|मान्य गैर-ऋणात्मक मात्राएँ दर्ज करें|Geli tirooyin sax ah oo aan tabanayn
Enter a valid number of days|Weka idadi halali ya siku|Saisissez un nombre de jours valide|أدخل عدد أيام صالحًا|Introduce un número válido de días|Digite um número válido de dias|Gültige Anzahl von Tagen eingeben|Inserisci un numero valido di giorni|输入有效天数|दिनों की मान्य संख्या दर्ज करें|Geli tiro maalmo oo sax ah
No recommendations returned|Hakuna mapendekezo yaliyorejeshwa|Aucune recommandation reçue|لم تُرجع أي توصيات|No se recibieron recomendaciones|Nenhuma recomendação recebida|Keine Empfehlungen erhalten|Nessun consiglio ricevuto|未返回建议|कोई सुझाव प्राप्त नहीं हुआ|Wax talooyin ah lama helin
AI request failed|Ombi la AI limeshindwa|Échec de la requête IA|فشل طلب الذكاء الاصطناعي|Error en la solicitud a la IA|Falha na solicitação à IA|KI-Anfrage fehlgeschlagen|Richiesta IA non riuscita|AI请求失败|AI अनुरोध विफल|Codsiga AI wuu fashilmay
Reorder|Agiza tena|Réapprovisionner|إعادة الطلب|Reponer|Repor|Nachbestellen|Riordina|补货|पुनः ऑर्डर करें|Dib u dalbo
Advice only|Ushauri pekee|À titre indicatif uniquement|للاسترشاد فقط|Solo orientativo|Apenas orientação|Nur als Empfehlung|Solo indicativo|仅供参考|केवल सलाह|Talo keliya
Paid|Imelipwa|Payé|مدفوع|Pagado|Pago|Bezahlt|Pagato|已付款|भुगतान किया गया|La bixiyay
Dashboard|Dashibodi|Tableau de bord|لوحة التحكم|Panel|Painel|Dashboard|Dashboard|仪表盘|डैशबोर्ड|Dulmar
Purchases|Manunuzi|Achats|المشتريات|Compras|Compras|Einkäufe|Acquisti|采购|खरीद|Wax iibsiga
Expenses|Matumizi|Dépenses|المصروفات|Gastos|Despesas|Ausgaben|Spese|支出|खर्च|Kharashaadka
Profit|Faida|Bénéfice|الربح|Beneficio|Lucro|Gewinn|Utile|利润|लाभ|Faa'iido
Not available yet|Bado haipatikani|Pas encore disponible|غير متاح بعد|Aún no disponible|Ainda não disponível|Noch nicht verfügbar|Non ancora disponibile|暂不可用|अभी उपलब्ध नहीं|Weli lama heli karo
Employees|Wafanyakazi|Employés|الموظفون|Empleados|Funcionários|Mitarbeiter|Dipendenti|员工|कर्मचारी|Shaqaalaha
Payroll due|Malipo ya mishahara yaliyoiva|Paie due|الرواتب المستحقة|Nómina pendiente|Folha de pagamento devida|Fällige Gehaltsabrechnung|Paga dovuta|待发工资|वेतन देय|Mushaharka la bixinayo
Commission|Kamisheni|Commission|العمولة|Comisión|Comissão|Provision|Commissione|佣金|कमीशन|Komishan
Commission history|Historia ya kamisheni|Historique des commissions|سجل العمولات|Historial de comisiones|Histórico de comissões|Provisionsverlauf|Cronologia commissioni|佣金历史|कमीशन इतिहास|Taariikhda komishanka
No commission yet|Hakuna kamisheni bado|Aucune commission pour l'instant|لا توجد عمولة بعد|Aún no hay comisión|Nenhuma comissão ainda|Noch keine Provision|Nessuna commissione ancora|暂无佣金|अभी तक कोई कमीशन नहीं|Weli komishan ma jiro
Awaiting payment|Inasubiri malipo|En attente de paiement|بانتظار الدفع|Esperando pago|Aguardando pagamento|Zahlung ausstehend|In attesa di pagamento|等待付款|भुगतान लंबित|Sugaya lacag-bixin
Employee added|Mfanyakazi ameongezwa|Employé ajouté|تمت إضافة الموظف|Empleado añadido|Funcionário adicionado|Mitarbeiter hinzugefügt|Dipendente aggiunto|员工已添加|कर्मचारी जोड़ा गया|Shaqaale lagu daray
Add employee|Ongeza mfanyakazi|Ajouter un employé|إضافة موظف|Añadir empleado|Adicionar funcionário|Mitarbeiter hinzufügen|Aggiungi dipendente|添加员工|कर्मचारी जोड़ें|Ku dar shaqaale
Name|Jina|Nom|الاسم|Nombre|Nome|Name|Nome|姓名|नाम|Magaca
Role|Jukumu|Rôle|الدور|Rol|Função|Rolle|Ruolo|职位|भूमिका|Xilka
Fixed salary|Mshahara maalum|Salaire fixe|راتب ثابت|Salario fijo|Salário fixo|Festgehalt|Stipendio fisso|固定工资|निश्चित वेतन|Mushahar go'an
Salary + commission|Mshahara + kamisheni|Salaire + commission|راتب + عمولة|Salario + comisión|Salário + comissão|Gehalt + Provision|Stipendio + commissione|工资 + 佣金|वेतन + कमीशन|Mushahar + komishan
Commission only|Kamisheni pekee|Commission uniquement|عمولة فقط|Solo comisión|Somente comissão|Nur Provision|Solo commissione|仅佣金|केवल कमीशन|Komishan keliya
Monthly salary|Mshahara wa mwezi|Salaire mensuel|الراتب الشهري|Salario mensual|Salário mensal|Monatsgehalt|Stipendio mensile|月薪|मासिक वेतन|Mushaharka bishii
% of sale|% ya mauzo|% des ventes|نسبة مئوية من المبيعات|% de venta|% da venda|% des Verkaufs|% di vendita|销售百分比|बिक्री का प्रतिशत|% iibka
Fixed per sale|Kiasi maalum kwa kila mauzo|Fixe par vente|مبلغ ثابت لكل بيع|Fijo por venta|Fixo por venda|Fest pro Verkauf|Fisso per vendita|每笔销售固定金额|प्रति बिक्री निश्चित|Lacag go'an iibkiiba
% of profit|% ya faida|% de profit|نسبة مئوية من الأرباح|% de ganancia|% do lucro|% des Gewinns|% di profitto|利润百分比|लाभ का प्रतिशत|% faa'iidada
Value|Thamani|Valeur|القيمة|Valor|Valor|Wert|Valore|价值|मूल्य|Qiime
Eligible paid sales only|Mauzo yaliyolipwa yanayostahiki tu|Ventes payées éligibles uniquement|المبيعات المدفوعة المؤهلة فقط|Solo ventas pagadas elegibles|Somente vendas pagas elegíveis|Nur berechtigte bezahlte Verkäufe|Solo vendite pagate idonee|仅限符合条件的已支付销售额|केवल पात्र भुगतान की गई बिक्री|Iibka u qalma ee la bixiyay keliya
All employees|Wafanyakazi wote|Tous les employés|جميع الموظفين|Todos los empleados|Todos os funcionários|Alle Mitarbeiter|Tutti i dipendenti|所有员工|सभी कर्मचारी|Dhammaan shaqaalaha
No employees yet|Hakuna wafanyakazi bado|Aucun employé pour l'instant|لا يوجد موظفون بعد|Aún no hay empleados|Nenhum funcionário ainda|Noch keine Mitarbeiter|Nessun dipendente ancora|暂无员工|अभी तक कोई कर्मचारी नहीं|Weli shaqaale ma jiraan
Salary|Mshahara|Salaire|الراتب|Salario|Salário|Gehalt|Stipendio|工资|वेतन|Mushahar
Balance|Salio|Solde|الرصيد|Saldo|Saldo|Saldo|Saldo|余额|शेष|Haraaga
Process payroll|Fanya malipo ya mishahara|Traiter la paie|معالجة الرواتب|Procesar nómina|Processar folha de pagamento|Gehaltsabrechnung verarbeiten|Elabora busta paga|处理工资|वेतन प्रक्रिया करें|Diyaari mushaharka
Deductions|Makato|Déductions|الخصومات|Deducciones|Deduções|Abzüge|Deduzioni|扣除|कटौतियाँ|Lacagaha laga jarayo
Gross pay|Malipo jumla|Salaire brut|إجمالي الأجر|Salario bruto|Salário bruto|Bruttolohn|Paga lorda|总薪酬|सकल वेतन|Mushaharka guud
Net pay|Malipo halisi|Salaire net|صافي الأجر|Salario neto|Salário líquido|Nettolohn|Paga netta|净薪酬|शुद्ध वेतन|Mushaharka saafiga ah
Payroll confirmed|Malipo ya mishahara yamethibitishwa|Paie confirmée|تم تأكيد الرواتب|Nómina confirmada|Folha de pagamento confirmada|Gehaltsabrechnung bestätigt|Paga confermata|工资已确认|वेतन की पुष्टि हो गई|Mushahar-bixinta la xaqiijiyay
Confirm payroll|Thibitisha malipo ya mishahara|Confirmer la paie|تأكيد الرواتب|Confirmar nómina|Confirmar folha de pagamento|Gehaltsabrechnung bestätigen|Conferma busta paga|确认工资|वेतन की पुष्टि करें|Xaqiiji mushahar bixinta
Payroll history|Historia ya malipo ya mishahara|Historique de la paie|سجل الرواتب|Historial de nóminas|Histórico de folha de pagamento|Gehaltsabrechnungsverlauf|Cronologia buste paga|工资历史|वेतन इतिहास|Taariikhda mushahar bixinta
No payroll yet|Hakuna malipo ya mishahara bado|Aucune paie pour l'instant|لا توجد رواتب بعد|Aún no hay nóminas|Nenhuma folha de pagamento ainda|Noch keine Gehaltsabrechnung|Nessuna busta paga ancora|暂无工资|अभी तक कोई वेतन नहीं|Weli mushahar lama bixin
Payment recorded|Malipo yamerekodiwa|Paiement enregistré|تم تسجيل الدفع|Pago registrado|Pagamento registrado|Zahlung erfasst|Pagamento registrato|付款已记录|भुगतान दर्ज किया गया|Lacag bixinta waa la diiwaangeliyay
Pay|Lipa|Payer|دفع|Pagar|Pagar|Zahlen|Paga|支付|भुगतान करें|Bixi
Commission by employee|Kamisheni kwa mfanyakazi|Commission par employé|عمولة حسب الموظف|Comisión por empleado|Comissão por funcionário|Provision nach Mitarbeiter|Commissione per dipendente|按员工计算佣金|कर्मचारी द्वारा कमीशन|Komishanka shaqaale kasta
To|Kwa|À|إلى|A|Para|Bis|A|到|को|Ilaa
Save report|Hifadhi ripoti|Enregistrer le rapport|حفظ التقرير|Guardar informe|Salvar relatório|Bericht speichern|Salva rapporto|保存报告|रिपोर्ट सहेजें|Kaydi warbixinta
Export CSV|Hamisha CSV|Exporter CSV|تصدير CSV|Exportar CSV|Exportar CSV|CSV exportieren|Esporta CSV|导出 CSV|CSV निर्यात करें|Dhoofi CSV
No records in this period|Hakuna rekodi katika kipindi hiki|Aucun enregistrement pour cette période|لا توجد سجلات في هذه الفترة|No hay registros en este período|Nenhum registro neste período|Keine Aufzeichnungen in diesem Zeitraum|Nessun record in questo periodo|此期间无记录|इस अवधि में कोई रिकॉर्ड नहीं|Diiwaanno ma jiraan muddadan
Seller|Muuzaji|Vendeur|البائع|Vendedor|Vendedor|Verkäufer|Venditore|销售员|विक्रेता|Iibiye
No seller|Hakuna muuzaji|Pas de vendeur|لا يوجد بائع|Sin vendedor|Nenhum vendedor|Kein Verkäufer|Nessun venditore|无销售员|कोई विक्रेता नहीं|Iibiye ma jiro
Sales returns|Marejesho ya mauzo|Retours de ventes|مرتجعات المبيعات|Devoluciones de ventas|Devoluções de vendas|Verkaufsretouren|Resi di vendita|销售退货|बिक्री वापसी|Iibka la soo celiyay
Purchase returns|Marejesho ya ununuzi|Retours d'achats|مرتجعات المشتريات|Devoluciones de compras|Devoluções de compra|Einkaufsretouren|Resi di acquisto|采购退货|खरीद वापसी|Iibsiga la celiyay
Refunded|Imerejeshwa|Remboursé|تم الاسترداد|Reembolsado|Reembolsado|Erstattet|Rimborsato|已退款|वापस कर दिया गया|Lacagta waa la celiyay
Sales by product|Mauzo kwa bidhaa|Ventes par produit|المبيعات حسب المنتج|Ventas por producto|Vendas por produto|Verkäufe nach Produkt|Vendite per prodotto|按产品销售|उत्पाद द्वारा बिक्री|Iibka badeecad kasta
Average sale|Mauzo ya wastani|Vente moyenne|متوسط البيع|Venta promedio|Venda média|Durchschnittlicher Verkauf|Vendita media|平均销售额|औसत बिक्री|Celceliska iibka
Stock valuation|Tathmini ya hisa|Valorisation des stocks|تقييم المخزون|Valoración de existencias|Avaliação de estoque|Lagerbewertung|Valutazione scorte|库存估值|स्टॉक मूल्यांकन|Qiimaynta kaydka
Returns history|Historia ya marejesho|Historique des retours|سجل المرتجعات|Historial de devoluciones|Histórico de devoluções|Retourenverlauf|Cronologia resi|退货历史|वापसी इतिहास|Taariikhda celinta
Seller not found|Muuzaji hakupatikana|Vendeur introuvable|لم يتم العثور على البائع|Vendedor no encontrado|Vendedor não encontrado|Verkäufer nicht gefunden|Venditore non trovato|未找到销售员|विक्रेता नहीं मिला|Iibiyaha lama helin
Enter an employee name|Weka jina la mfanyakazi|Saisissez un nom d'employé|أدخل اسم موظف|Introduce un nombre de empleado|Insira um nome de funcionário|Geben Sie einen Mitarbeiternamen ein|Inserisci il nome di un dipendente|输入员工姓名|एक कर्मचारी का नाम दर्ज करें|Geli magaca shaqaalaha
Enter a valid salary|Weka mshahara halali|Saisissez un salaire valide|أدخل راتبًا صالحًا|Introduce un salario válido|Insira um salário válido|Geben Sie ein gültiges Gehalt ein|Inserisci uno stipendio valido|输入有效工资|एक वैध वेतन दर्ज करें|Geli mushahar sax ah
Set a commission rule|Weka kanuni ya kamisheni|Définir une règle de commission|تحديد قاعدة عمولة|Establece una regla de comisión|Defina uma regra de comissão|Legen Sie eine Provisionsregel fest|Imposta una regola per la commissione|设置佣金规则|एक कमीशन नियम सेट करें|Deji xeerka komishanka
Percentage can't exceed 100|Asilimia haiwezi kuzidi 100|Le pourcentage ne peut excéder 100|لا يمكن أن تتجاوز النسبة المئوية 100|El porcentaje no puede exceder 100|A porcentagem não pode exceder 100|Prozentsatz darf 100 nicht überschreiten|La percentuale non può superare il 100|百分比不能超过 100|प्रतिशत 100 से अधिक नहीं हो सकता|Boqolkiiba kama badnaan karo 100
Employee not found|Mfanyakazi hakupatikana|Employé introuvable|لم يتم العثور على الموظف|Empleado no encontrado|Funcionário não encontrado|Mitarbeiter nicht gefunden|Dipendente non trovato|未找到员工|कर्मचारी नहीं मिला|Shaqaalaha lama helin
Choose a valid period|Chagua kipindi halali|Choisissez une période valide|اختر فترة صالحة|Elige un período válido|Escolha um período válido|Wählen Sie einen gültigen Zeitraum|Scegli un periodo valido|选择一个有效期间|एक वैध अवधि चुनें|Dooro muddo sax ah
Deductions can't be negative|Makato hayawezi kuwa hasi|Les déductions ne peuvent pas être négatives|لا يمكن أن تكون الخصومات سالبة|Las deducciones no pueden ser negativas|As deduções não podem ser negativas|Abzüge können nicht negativ sein|Le deduzioni non possono essere negative|扣除不能为负|कटौतियाँ नकारात्मक नहीं हो सकतीं|Wax-ka-jaristu kama yaraan karto eber
Payroll already confirmed for this period|Malipo ya mishahara tayari yamethibitishwa kwa kipindi hiki|Paie déjà confirmée pour cette période|تم تأكيد الرواتب بالفعل لهذه الفترة|Nómina ya confirmada para este período|Folha de pagamento já confirmada para este período|Gehaltsabrechnung für diesen Zeitraum bereits bestätigt|Paga già confermata per questo periodo|此期间的工资已确认|इस अवधि के लिए वेतन पहले ही पुष्टि हो चुकी है|Mushahar bixinta muddadan hore ayaa loo xaqiijiyay
Deductions exceed gross pay|Makato yanazidi malipo jumla|Les déductions dépassent le salaire brut|الخصومات تتجاوز إجمالي الأجر|Las deducciones exceden el salario bruto|As deduções excedem o salário bruto|Abzüge übersteigen das Bruttogehalt|Le deduzioni superano la paga lorda|扣除额超过总薪酬|कटौतियाँ सकल वेतन से अधिक हैं|Wax-ka-jaristu waxay dhaaftay mushaharka guud
Payroll not found|Malipo ya mishahara hayakupatikana|Paie introuvable|لم يتم العثور على الرواتب|Nómina no encontrada|Folha de pagamento não encontrada|Gehaltsabrechnung nicht gefunden|Busta paga non trovata|未找到工资|वेतन नहीं मिला|Mushahar bixinta lama helin
Amount is more than the outstanding pay|Kiasi ni kikubwa kuliko malipo yanayosubiri|Le montant est supérieur au paiement en suspens|المبلغ أكبر من الدفعة المستحقة|La cantidad es mayor que el pago pendiente|O valor é maior do que o pagamento pendente|Der Betrag ist höher als die ausstehende Zahlung|L'importo è superiore alla paga in sospeso|金额超过未支付的工资|राशि बकाया भुगतान से अधिक है|Lacagtu waxay ka badan tahay mushaharka haray
EARNED|IMEPATIKANA|GANHE|مكتسب|GANADO|GANHO|VERDIENT|GUADAGNATO|已赚取|अर्जित|LA KASBADAY
RETURN ADJUSTMENT|MABADILIKO YA MAREJESHO|AJUSTEMENT DE RETOUR|تعديل المرتجع|AJUSTE DE DEVOLUCIÓN|AJUSTE DE DEVOLUÇÃO|RÜCKGABEANPASSUNG|ADEGUAMENTO RESO|退货调整|वापसी समायोजन|HAGAAJINTA CELINTA
NOT RETURNED|HAIJAREJESHWA|NON RETOURNÉ|لم يتم الإرجاع|NO DEVUELTO|NÃO DEVOLVIDO|NICHT ZURÜCKGEGEBEN|NON RESTITUITO|未退回|वापस नहीं किया गया|LAMA CELIN
PARTIALLY RETURNED|IMEREJESHWA KIASI|PARTIELLEMENT RETOURNÉ|تم الإرجاع جزئيًا|DEVUELTO PARCIALMENTE|PARCIALMENTE DEVOLVIDO|TEILWEISE ZURÜCKGEGEBEN|PARZIALMENTE RESTITUITO|部分退回|आंशिक रूप से वापस किया गया|QAYB AYAA LA CELIYAY
FULLY RETURNED|IMEREJESHWA KIKAMILIFU|ENTIÈREMENT RETOURNÉ|تم الإرجاع بالكامل|TOTALMENTE DEVUELTO|TOTALMENTE DEVOLVIDO|VOLLSTÄNDIG ZURÜCKGEGEBEN|COMPLETAMENTE RESTITUITO|已全额退回|पूरी तरह से वापस किया गया|DHAMMAAN WAA LA CELIYAY
Payroll|Malipo ya mishahara|Paie|الرواتب|Nómina|Folha de pagamento|Gehaltsabrechnung|Paga|工资|वेतन|Mushahar bixin
Builder|Mjenzi|Constructeur|المنشئ|Constructor|Construtor|Builder|Costruttore|构建器|निर्माता|Dhise
Business insights|Maarifa ya biashara|Analyses commerciales|رؤى الأعمال|Análisis del negocio|Análises do negócio|Geschäftseinblicke|Analisi aziendali|经营洞察|व्यवसाय संबंधी जानकारी|Falanqaynta ganacsiga
No sales in this period|Hakuna mauzo katika kipindi hiki|Aucune vente sur cette période|لا توجد مبيعات خلال هذه الفترة|No hay ventas en este período|Nenhuma venda neste período|Keine Verkäufe in diesem Zeitraum|Nessuna vendita in questo periodo|此期间无销售|इस अवधि में कोई बिक्री नहीं|Iib ma jiro muddadan
Best seller|Bidhaa inayouzwa zaidi|Meilleure vente|المنتج الأكثر مبيعًا|Producto más vendido|Produto mais vendido|Meistverkaufter Artikel|Prodotto più venduto|畅销商品|सबसे अधिक बिकने वाला उत्पाद|Kan ugu iibka badan
Credit sales|Mauzo ya mkopo|Ventes à crédit|مبيعات آجلة|Ventas a crédito|Vendas a crédito|Verkäufe auf Kredit|Vendite a credito|赊销|उधार बिक्री|Iibka deynta ah
Sales by seller|Mauzo kwa muuzaji|Ventes par vendeur|المبيعات حسب البائع|Ventas por vendedor|Vendas por vendedor|Verkäufe nach Verkäufer|Vendite per venditore|按销售员统计销售额|विक्रेता के अनुसार बिक्री|Iibka iibiye kasta
Retail value|Thamani ya rejareja|Valeur au détail|القيمة بسعر التجزئة|Valor de venta al público|Valor de varejo|Einzelhandelswert|Valore al dettaglio|零售价值|खुदरा मूल्य|Qiimaha tafaariiqda
At selling price|Kwa bei ya kuuza|Au prix de vente|بسعر البيع|A precio de venta|Ao preço de venda|Zum Verkaufspreis|Al prezzo di vendita|按销售价|बिक्री मूल्य पर|Qiimaha iibinta
Receivables|Madeni ya kupokea|Créances|الذمم المدينة|Cuentas por cobrar|Contas a receber|Forderungen|Crediti da riscuotere|应收账款|प्राप्य राशि|Deymaha la sugayo
Payables|Madeni ya kulipa|Dettes à payer|الذمم الدائنة|Cuentas por pagar|Contas a pagar|Verbindlichkeiten|Debiti da pagare|应付账款|देय राशि|Deymaha la bixinayo
Owed to customers|Kiasi tunachowadai na wateja|Sommes dues aux clients|مبالغ مستحقة للعملاء|Importes adeudados a clientes|Valores devidos aos clientes|Kunden geschuldete Beträge|Importi dovuti ai clienti|欠客户款项|ग्राहकों को देय राशि|Deynta macaamiisha loo qabo
Last 14 days|Siku 14 zilizopita|14 derniers jours|آخر 14 يومًا|Últimos 14 días|Últimos 14 dias|Letzte 14 Tage|Ultimi 14 giorni|过去14天|पिछले 14 दिन|14-kii maalmood ee u dambeeyay
Replace all records on this device with this backup?|Ungependa kubadilisha rekodi zote kwenye kifaa hiki kwa kutumia nakala hii ya akiba?|Remplacer tous les enregistrements de cet appareil par cette sauvegarde ?|هل تريد استبدال جميع السجلات على هذا الجهاز بهذه النسخة الاحتياطية؟|¿Reemplazar todos los registros de este dispositivo con esta copia de seguridad?|Substituir todos os registros deste dispositivo por este backup?|Alle Datensätze auf diesem Gerät durch diese Sicherung ersetzen?|Sostituire tutti i record su questo dispositivo con questo backup?|要用此备份替换此设备上的所有记录吗？|क्या इस डिवाइस के सभी रिकॉर्ड इस बैकअप से बदलें?|Kaydkan ma lagu beddelaa dhammaan diiwaannada qalabkan?
Backup restored|Nakala ya akiba imerejeshwa|Sauvegarde restaurée|تمت استعادة النسخة الاحتياطية|Copia de seguridad restaurada|Backup restaurado|Sicherung wiederhergestellt|Backup ripristinato|备份已恢复|बैकअप बहाल हो गया|Kaydkii waa la soo celiyay
Appearance|Mwonekano|Apparence|المظهر|Apariencia|Aparência|Darstellung|Aspetto|外观|दिखावट|Muuqaalka
Enter a valid shop name and email|Weka jina halali la duka na anwani halali ya barua pepe|Saisissez un nom de boutique et une adresse e-mail valides|أدخل اسم متجر وعنوان بريد إلكتروني صالحين|Introduce un nombre de tienda y un correo electrónico válidos|Insira um nome de loja e um e-mail válidos|Geben Sie einen gültigen Shopnamen und eine gültige E-Mail-Adresse ein|Inserisci un nome del negozio e un indirizzo email validi|请输入有效的店铺名称和电子邮箱地址|दुकान का मान्य नाम और ईमेल दर्ज करें|Geli magac dukaan iyo iimayl sax ah
Staff accounts and roles are not available yet.|Akaunti na majukumu ya wafanyakazi bado havipatikani.|Les comptes et rôles du personnel ne sont pas encore disponibles.|حسابات الموظفين وأدوارهم غير متاحة بعد.|Las cuentas y los roles del personal aún no están disponibles.|As contas e funções dos funcionários ainda não estão disponíveis.|Mitarbeiterkonten und Rollen sind noch nicht verfügbar.|Gli account e i ruoli del personale non sono ancora disponibili.|员工账户和角色功能尚未开放。|कर्मचारियों के खाते और भूमिकाएँ अभी उपलब्ध नहीं हैं।|Akoonnada iyo doorarka shaqaaluhu weli ma jiraan.
Next|Endelea|Suivant|التالي|Siguiente|Próximo|Weiter|Avanti|下一步|अगला|Xiga
Numbers are never reused, so records stay traceable.|Nambari hazitumiki tena kamwe, hivyo rekodi zinaendelea kufuatilika.|Les numéros ne sont jamais réutilisés, ce qui garantit la traçabilité des enregistrements.|لا تُعاد استخدام الأرقام مطلقًا، لتظل السجلات قابلة للتتبع.|Los números nunca se reutilizan, por lo que los registros siguen siendo rastreables.|Os números nunca são reutilizados, mantendo os registros rastreáveis.|Nummern werden nie wiederverwendet, damit Datensätze nachvollziehbar bleiben.|I numeri non vengono mai riutilizzati, così i record restano tracciabili.|编号不会重复使用，确保记录始终可追溯。|नंबरों का दोबारा उपयोग कभी नहीं किया जाता, इसलिए रिकॉर्ड का पता लगाया जा सकता है।|Lambarrada dib looma isticmaalo, si diiwaannada loo raadraaco.
Saved on this device|Imehifadhiwa kwenye kifaa hiki|Enregistré sur cet appareil|محفوظ على هذا الجهاز|Guardado en este dispositivo|Salvo neste dispositivo|Auf diesem Gerät gespeichert|Salvato su questo dispositivo|已保存在此设备上|इस डिवाइस पर सहेजा गया|Qalabkan ayaa lagu kaydiyay
Last backup file|Faili ya mwisho ya nakala ya akiba|Dernier fichier de sauvegarde|آخر ملف نسخ احتياطي|Último archivo de copia de seguridad|Último arquivo de backup|Letzte Sicherungsdatei|Ultimo file di backup|最近的备份文件|पिछली बैकअप फ़ाइल|Faylka kaydka ugu dambeeyay
No backup file yet|Bado hakuna faili ya nakala ya akiba|Aucun fichier de sauvegarde pour le moment|لا يوجد ملف نسخ احتياطي بعد|Aún no hay ningún archivo de copia de seguridad|Ainda não há arquivo de backup|Noch keine Sicherungsdatei|Nessun file di backup ancora|暂无备份文件|अभी तक कोई बैकअप फ़ाइल नहीं है|Weli fayl kayd ah ma jiro
Download backup|Pakua nakala ya akiba|Télécharger la sauvegarde|تنزيل النسخة الاحتياطية|Descargar copia de seguridad|Baixar backup|Sicherung herunterladen|Scarica backup|下载备份|बैकअप डाउनलोड करें|Soo dejiso kaydka
Restore backup|Rejesha nakala ya akiba|Restaurer la sauvegarde|استعادة النسخة الاحتياطية|Restaurar copia de seguridad|Restaurar backup|Sicherung wiederherstellen|Ripristina backup|恢复备份|बैकअप बहाल करें|Soo celi kaydka
Demo data|Data za majaribio|Données de démo|بيانات تجريبية|Datos de demostración|Dados de demonstração|Demodaten|Dati demo|演示数据|डेमो डेटा|Xog tijaabo ah
Sample electronics shop for testing every app. Real shops start empty.|Duka la mfano la elektroniki kujaribu kila programu. Maduka halisi huanza bila data.|Boutique d’électronique fictive pour tester chaque application. Les vraies boutiques démarrent vides.|متجر إلكترونيات تجريبي لاختبار كل تطبيق. المتاجر الحقيقية تبدأ فارغة.|Tienda de electrónica de ejemplo para probar cada app. Las tiendas reales empiezan vacías.|Loja de eletrônicos de exemplo para testar cada app. Lojas reais começam vazias.|Beispiel-Elektronikladen zum Testen aller Apps. Echte Shops starten leer.|Negozio di elettronica di esempio per testare ogni app. I negozi reali partono vuoti.|用于测试各应用的示例电子商店。真实店铺从空白开始。|हर ऐप की जाँच के लिए नमूना इलेक्ट्रॉनिक्स दुकान। असली दुकानें खाली शुरू होती हैं।|Dukaan elektaroonig ah oo tusaale u ah tijaabinta ab kasta. Dukaamada dhabta ahi madhan ayay ku bilaabmaan.
Load demo data|Pakia data za majaribio|Charger les données de démo|تحميل البيانات التجريبية|Cargar datos de demostración|Carregar dados de demonstração|Demodaten laden|Carica dati demo|加载演示数据|डेमो डेटा लोड करें|Ku shub xogta tijaabada
Reset demo data|Weka upya data za majaribio|Réinitialiser les données de démo|إعادة تعيين البيانات التجريبية|Restablecer datos de demostración|Redefinir dados de demonstração|Demodaten zurücksetzen|Reimposta dati demo|重置演示数据|डेमो डेटा रीसेट करें|Dib u deji xogta tijaabada
Remove demo data|Ondoa data za majaribio|Supprimer les données de démo|إزالة البيانات التجريبية|Eliminar datos de demostración|Remover dados de demonstração|Demodaten entfernen|Rimuovi dati demo|删除演示数据|डेमो डेटा हटाएँ|Ka saar xogta tijaabada
Reset demo data? A backup is kept first.|Weka upya data za majaribio? Nakala ya akiba itahifadhiwa kwanza.|Réinitialiser les données de démo ? Une sauvegarde est conservée.|إعادة تعيين البيانات التجريبية؟ سيتم حفظ نسخة احتياطية أولاً.|¿Restablecer los datos de demostración? Primero se guarda una copia.|Redefinir os dados de demonstração? Um backup é guardado antes.|Demodaten zurücksetzen? Vorher wird eine Sicherung gespeichert.|Reimpostare i dati demo? Prima viene salvato un backup.|重置演示数据？会先保留备份。|डेमो डेटा रीसेट करें? पहले बैकअप रखा जाएगा।|Dib ma loo dejiyaa xogta tijaabada? Marka hore kayd ayaa la samaynayaa.
Remove demo data and start with an empty shop?|Ondoa data za majaribio na uanze na duka tupu?|Supprimer les données de démo et démarrer avec une boutique vide ?|إزالة البيانات التجريبية والبدء بمتجر فارغ؟|¿Eliminar los datos de demostración y empezar con una tienda vacía?|Remover os dados de demonstração e começar com uma loja vazia?|Demodaten entfernen und mit leerem Shop starten?|Rimuovere i dati demo e iniziare con un negozio vuoto?|删除演示数据并以空店铺开始？|डेमो डेटा हटाकर खाली दुकान से शुरू करें?|Ma laga saaraa xogta tijaabada oo dukaan madhan lagu bilaabaa?
Demo data loaded|Data za majaribio zimepakiwa|Données de démo chargées|تم تحميل البيانات التجريبية|Datos de demostración cargados|Dados de demonstração carregados|Demodaten geladen|Dati demo caricati|演示数据已加载|डेमो डेटा लोड हुआ|Xogtii tijaabada waa la geliyay
Demo data reset|Data za majaribio zimewekwa upya|Données de démo réinitialisées|تمت إعادة تعيين البيانات التجريبية|Datos de demostración restablecidos|Dados de demonstração redefinidos|Demodaten zurückgesetzt|Dati demo reimpostati|演示数据已重置|डेमो डेटा रीसेट हुआ|Xogtii tijaabada dib ayaa loo dejiyay
Demo data removed|Data za majaribio zimeondolewa|Données de démo supprimées|تمت إزالة البيانات التجريبية|Datos de demostración eliminados|Dados de demonstração removidos|Demodaten entfernt|Dati demo rimossi|演示数据已删除|डेमो डेटा हटाया गया|Xogtii tijaabada waa laga saaray
Demo data can only be loaded into an empty shop|Data za majaribio zinaweza kupakiwa kwenye duka tupu pekee|Les données de démo ne peuvent être chargées que dans une boutique vide|يمكن تحميل البيانات التجريبية في متجر فارغ فقط|Los datos de demostración solo se cargan en una tienda vacía|Os dados de demonstração só podem ser carregados numa loja vazia|Demodaten können nur in einen leeren Shop geladen werden|I dati demo si possono caricare solo in un negozio vuoto|演示数据只能加载到空店铺|डेमो डेटा केवल खाली दुकान में लोड हो सकता है|Xogta tijaabada waxaa lagu shubi karaa dukaan madhan oo keliya
Audit log|Kumbukumbu ya ukaguzi|Journal d’audit|سجل التدقيق|Registro de auditoría|Registro de auditoria|Auditprotokoll|Registro di audit|审计日志|ऑडिट लॉग|Diiwaanka kormeerka
No activity yet|Bado hakuna shughuli|Aucune activité pour le moment|لا يوجد نشاط بعد|Aún no hay actividad|Ainda não há atividade|Noch keine Aktivitäten|Nessuna attività ancora|暂无活动|अभी तक कोई गतिविधि नहीं है|Weli wax hawl ah ma jiraan
Manage Subscription|Dhibiti usajili|Gérer l’abonnement|إدارة الاشتراك|Gestionar suscripción|Gerenciar assinatura|Abonnement verwalten|Gestisci abbonamento|管理订阅|सदस्यता प्रबंधित करें|Maamul rukumashada
Sales breakdown|Mchanganuo wa mauzo|Répartition des ventes|تفصيل المبيعات|Desglose de ventas|Detalhamento das vendas|Verkaufsaufschlüsselung|Ripartizione delle vendite|销售明细|बिक्री का विवरण|Faahfaahinta iibka
Money|Fedha|Argent|الأموال|Dinero|Dinheiro|Geld|Denaro|资金|धन|Lacag
Needs attention|Inahitaji uangalizi|Nécessite votre attention|يتطلب الانتباه|Requiere atención|Requer atenção|Handlungsbedarf|Richiede attenzione|需要关注|ध्यान देने की आवश्यकता है|U baahan fiiro
Backed up|Imehifadhiwa|Sauvegardé|تم النسخ الاحتياطي|Copia hecha|Backup feito|Gesichert|Backup eseguito|已备份|बैकअप हो गया|Kayd ayaa laga sameeyay
Backup pending|Hifadhi inasubiri|Sauvegarde en attente|النسخ الاحتياطي معلق|Copia pendiente|Backup pendente|Sicherung ausstehend|Backup in sospeso|备份待处理|बैकअप लंबित|Kaydin ayaa sugaysa
now|sasa|maintenant|الآن|ahora|agora|jetzt|ora|刚刚|अभी|hadda
min ago|dak zilizopita|min|دقيقة مضت|min|min atrás|Min.|min fa|分钟前|मिनट पहले|daqiiqo ka hor
h ago|saa zilizopita|h|ساعة مضت|h|h atrás|Std.|h fa|小时前|घंटे पहले|saacad ka hor
d ago|siku zilizopita|j|يوم مضى|d|d atrás|T.|g fa|天前|दिन पहले|maalin ka hor
Refresh dashboard|Onyesha upya dashibodi|Actualiser le tableau de bord|تحديث لوحة التحكم|Actualizar panel|Atualizar painel|Dashboard aktualisieren|Aggiorna dashboard|刷新仪表板|डैशबोर्ड रीफ़्रेश करें|Cusboonaysii dulmarka
Export dashboard|Hamisha dashibodi|Exporter le tableau de bord|تصدير لوحة التحكم|Exportar panel|Exportar painel|Dashboard exportieren|Esporta dashboard|导出仪表板|डैशबोर्ड निर्यात करें|Dhoofi dulmarka
Share dashboard|Shiriki dashibodi|Partager le tableau de bord|مشاركة لوحة التحكم|Compartir panel|Compartilhar painel|Dashboard teilen|Condividi dashboard|分享仪表板|डैशबोर्ड साझा करें|Wadaag dulmarka
View details|Angalia maelezo|Voir les détails|عرض التفاصيل|Ver detalles|Ver detalhes|Details anzeigen|Vedi dettagli|查看详情|विवरण देखें|Eeg faahfaahinta
View all|Angalia zote|Tout voir|عرض الكل|Ver todo|Ver tudo|Alle anzeigen|Vedi tutto|查看全部|सभी देखें|Eeg dhammaan
This week|Wiki hii|Cette semaine|هذا الأسبوع|Esta semana|Esta semana|Diese Woche|Questa settimana|本周|इस सप्ताह|Toddobaadkan
This month|Mwezi huu|Ce mois-ci|هذا الشهر|Este mes|Este mês|Dieser Monat|Questo mese|本月|इस महीने|Bishan
This year|Mwaka huu|Cette année|هذا العام|Este año|Este ano|Dieses Jahr|Quest'anno|今年|इस वर्ष|Sannadkan
Custom|Maalum|Personnalisé|مخصص|Personalizado|Personalizado|Benutzerdefiniert|Personalizzato|自定义|कस्टम|Gaar ah
Business overview|Muhtasari wa biashara|Aperçu de l'activité|نظرة عامة على العمل|Resumen del negocio|Visão geral do negócio|Geschäftsübersicht|Panoramica aziendale|业务概览|व्यवसाय अवलोकन|Dulmarka ganacsiga
Sales by payment method|Mauzo kwa njia ya malipo|Ventes par mode de paiement|المبيعات حسب طريقة الدفع|Ventas por método de pago|Vendas por método de pagamento|Umsatz nach Zahlungsart|Vendite per metodo di pagamento|按付款方式的销售|भुगतान विधि द्वारा बिक्री|Iibka habka lacag-bixinta
Total sales|Jumla ya mauzo|Ventes totales|إجمالي المبيعات|Ventas totales|Vendas totais|Gesamtumsatz|Vendite totali|总销售额|कुल बिक्री|Wadarta iibka
Money position|Hali ya fedha|Position de trésorerie|الوضع المالي|Posición de dinero|Posição financeira|Geldbestand|Posizione di cassa|资金状况|धन की स्थिति|Xaaladda lacagta
Variance|Tofauti|Écart|فرق|Diferencia|Diferença|Abweichung|Differenza|差异|अंतर|Farqiga
Done|Imekamilika|Fait|تم|Hecho|Feito|Erledigt|Fatto|已完成|पूर्ण|La dhammeeyey
Period|Kipindi|Période|الفترة|Período|Período|Zeitraum|Periodo|期间|अवधि|Muddada
Cash-up|Kufunga hesabu za fedha taslimu|Clôture de caisse|إقفال الصندوق|Cierre de caja|Fechamento de caixa|Kassenabschluss|Chiusura di cassa|收银结算|नकदी मिलान|Xir xisaabta lacagta
General|Jumla|Général|عام|General|Geral|Allgemein|Generale|常规|सामान्य|Guud
Business|Biashara|Entreprise|الأعمال|Negocio|Negócio|Unternehmen|Azienda|商家|व्यवसाय|Ganacsi
Users & Access|Watumiaji na ruhusa za ufikiaji|Utilisateurs et accès|المستخدمون والوصول|Usuarios y acceso|Usuários e acesso|Benutzer und Zugriff|Utenti e accesso|用户与访问权限|उपयोगकर्ता और पहुँच|Isticmaalayaal & Gelitaan
Features|Vipengele|Fonctionnalités|الميزات|Funciones|Funcionalidades|Funktionen|Funzionalità|功能|सुविधाएँ|Astaamaha
Transaction numbering|Uwekaji nambari za miamala|Numérotation des transactions|ترقيم المعاملات|Numeración de transacciones|Numeração de transações|Transaktionsnummerierung|Numerazione delle transazioni|交易编号|लेन-देन क्रमांकन|Lambaraynta macaamilada
Data & System|Data na mfumo|Données et système|البيانات والنظام|Datos y sistema|Dados e sistema|Daten und System|Dati e sistema|数据与系统|डेटा और सिस्टम|Xogta & Nidaamka
Subscription|Usajili|Abonnement|الاشتراك|Suscripción|Assinatura|Abonnement|Abbonamento|订阅|सदस्यता|Rukunka
This is not a SHOPBOOK backup file|Hii si faili ya nakala ya akiba ya SHOPBOOK|Ce fichier n’est pas une sauvegarde SHOPBOOK|هذا ليس ملف نسخ احتياطي من SHOPBOOK|Este no es un archivo de copia de seguridad de SHOPBOOK|Este não é um arquivo de backup do SHOPBOOK|Dies ist keine SHOPBOOK-Sicherungsdatei|Questo non è un file di backup di SHOPBOOK|这不是 SHOPBOOK 备份文件|यह SHOPBOOK की बैकअप फ़ाइल नहीं है|Kani ma aha fayl kayd ah oo SHOPBOOK ah
Backup file is damaged|Faili ya nakala ya akiba imeharibika|Le fichier de sauvegarde est endommagé|ملف النسخ الاحتياطي تالف|El archivo de copia de seguridad está dañado|O arquivo de backup está corrompido|Die Sicherungsdatei ist beschädigt|Il file di backup è danneggiato|备份文件已损坏|बैकअप फ़ाइल क्षतिग्रस्त है|Faylka kaydku wuu dhaawacmay
Language|Lugha|Langue|اللغة|Idioma|Idioma|Sprache|Lingua|语言|भाषा|Luqadda
Currency|Sarafu|Devise|العملة|Moneda|Moeda|Währung|Valuta|货币|मुद्रा|Lacagta
Business performance|Utendaji wa biashara|Performance de l’entreprise|أداء الأعمال|Rendimiento del negocio|Desempenho do negócio|Geschäftsentwicklung|Andamento aziendale|经营表现|व्यवसाय का प्रदर्शन|Waxqabadka ganacsiga
Sales performance|Utendaji wa mauzo|Performance des ventes|أداء المبيعات|Rendimiento de ventas|Desempenho das vendas|Verkaufsleistung|Andamento delle vendite|销售业绩|बिक्री का प्रदर्शन|Waxqabadka iibka
Financial position|Hali ya kifedha|Situation financière|المركز المالي|Situación financiera|Posição financeira|Finanzlage|Situazione finanziaria|财务状况|वित्तीय स्थिति|Xaaladda maaliyadeed
Trends|Mienendo|Tendances|الاتجاهات|Tendencias|Tendências|Trends|Tendenze|趋势|रुझान|Isbeddellada
Week|Wiki|Semaine|أسبوع|Semana|Semana|Woche|Settimana|周|सप्ताह|Toddobaad
Month|Mwezi|Mois|شهر|Mes|Mês|Monat|Mese|月|महीना|Bil
Year|Mwaka|Année|سنة|Año|Ano|Jahr|Anno|年|वर्ष|Sannad
Summary|Muhtasari|Résumé|ملخص|Resumen|Resumo|Zusammenfassung|Riepilogo|摘要|सारांश|Soo koobid
Settings|Mipangilio|Paramètres|الإعدادات|Configuración|Configurações|Einstellungen|Impostazioni|设置|सेटिंग्स|Dejinta
BACKUP RESTORED|NAKALA YA AKIBA IMEREJESHWA|SAUVEGARDE RESTAURÉE|تمت استعادة النسخة الاحتياطية|COPIA DE SEGURIDAD RESTAURADA|BACKUP RESTAURADO|SICHERUNG WIEDERHERGESTELLT|BACKUP RIPRISTINATO|备份已恢复|बैकअप बहाल हो गया|KAYDKA WAA LA SOO CELIYEY
Accounting|Uhasibu|Comptabilité|المحاسبة|Contabilidad|Contabilidade|Buchhaltung|Contabilità|会计|लेखा|Xisaabaadka
Add expense|Ongeza gharama|Ajouter une dépense|إضافة مصروف|Añadir gasto|Adicionar despesa|Ausgabe hinzufügen|Aggiungi spesa|添加支出|खर्च जोड़ें|Ku dar kharash
Airtime|Muda wa maongezi|Crédit téléphonique|رصيد الهاتف|Saldo telefónico|Crédito de celular|Guthaben|Ricarica telefonica|话费|टॉकटाइम|Kaarka hadalka
Amount paid|Kiasi kilicholipwa|Montant payé|المبلغ المدفوع|Importe pagado|Valor pago|Gezahlter Betrag|Importo pagato|已付金额|भुगतान की गई राशि|Lacagta la bixiyey
Asset|Mali|Actif|أصل|Activo|Ativo|Vermögenswert|Attività|资产|परिसंपत्ति|Hanti
Assets|Mali|Actifs|الأصول|Activos|Ativos|Vermögen|Attività|资产|परिसंपत्तियाँ|Hantida
Balance sheet|Mizania|Bilan|الميزانية العمومية|Balance general|Balanço patrimonial|Bilanz|Stato patrimoniale|资产负债表|तुलन पत्र|Xaashida dheelitirka
Balances update automatically from sales, debt payments, purchases, expenses, payroll and returns.|Salio husasishwa kiotomatiki kutoka mauzo, malipo ya madeni, manunuzi, gharama, mishahara na marejesho.|Les soldes se mettent à jour automatiquement avec les ventes, paiements de dettes, achats, dépenses, salaires et retours.|تتحدث الأرصدة تلقائيًا من المبيعات وسداد الديون والمشتريات والمصروفات والرواتب والمرتجعات.|Los saldos se actualizan automáticamente con ventas, cobros de deudas, compras, gastos, nómina y devoluciones.|Os saldos atualizam automaticamente com vendas, pagamentos de dívidas, compras, despesas, folha e devoluções.|Salden aktualisieren sich automatisch aus Verkäufen, Schuldzahlungen, Einkäufen, Ausgaben, Lohn und Retouren.|I saldi si aggiornano automaticamente da vendite, incassi crediti, acquisti, spese, stipendi e resi.|余额会根据销售、收款、采购、支出、工资和退货自动更新。|बिक्री, कर्ज़ भुगतान, खरीद, खर्च, वेतन और वापसी से शेष अपने आप अपडेट होते हैं।|Haraagu si toos ah ayuu uga cusboonaadaa iibka, bixinta deynta, iibsiyada, kharashaadka, mushaharrada iyo alaabta la soo celiyey.
By category|Kwa aina|Par catégorie|حسب الفئة|Por categoría|Por categoria|Nach Kategorie|Per categoria|按类别|श्रेणी अनुसार|Qayb ahaan
Choose contact|Chagua mwasiliani|Choisir un contact|اختر جهة اتصال|Elegir contacto|Escolher contato|Kontakt wählen|Scegli contatto|选择联系人|संपर्क चुनें|Dooro xiriir
Choose purchase|Chagua manunuzi|Choisir un achat|اختر عملية شراء|Elegir compra|Escolher compra|Einkauf wählen|Scegli acquisto|选择采购单|खरीद चुनें|Dooro iibsi
Confirm purchase|Thibitisha manunuzi|Confirmer l'achat|تأكيد الشراء|Confirmar compra|Confirmar compra|Einkauf bestätigen|Conferma acquisto|确认采购|खरीद की पुष्टि करें|Xaqiiji iibsiga
Contacts|Mawasiliano|Contacts|جهات الاتصال|Contactos|Contatos|Kontakte|Contatti|联系人|संपर्क|Xiriirrada
Cost|Gharama|Coût|التكلفة|Costo|Custo|Kosten|Costo|成本|लागत|Qiimaha
Cost of goods sold|Gharama ya bidhaa zilizouzwa|Coût des marchandises vendues|تكلفة البضاعة المباعة|Costo de ventas|Custo das mercadorias vendidas|Wareneinsatz|Costo del venduto|销售成本|बेचे गए माल की लागत|Qiimaha alaabta la iibiyey
Debt|Deni|Dette|دين|Deuda|Dívida|Schuld|Debito|欠款|कर्ज़|Deyn
Deposit|Weka|Dépôt|إيداع|Depósito|Depósito|Einzahlung|Deposito|存入|जमा|Dhig lacag
Deposit or withdraw|Weka au toa|Déposer ou retirer|إيداع أو سحب|Depositar o retirar|Depositar ou sacar|Einzahlen oder abheben|Deposita o preleva|存入或取出|जमा या निकासी|Dhig ama la bax lacag
Electricity|Umeme|Électricité|الكهرباء|Electricidad|Eletricidade|Strom|Elettricità|电费|बिजली|Koronto
Entries|Maingizo|Écritures|القيود|Asientos|Lançamentos|Einträge|Registrazioni|条目|प्रविष्टियाँ|Diiwaangelinno
Equity|Mtaji|Capitaux propres|حقوق الملكية|Patrimonio|Patrimônio|Eigenkapital|Patrimonio netto|权益|पूंजी|Raasamaalka saafiga ah
Expense|Gharama|Dépense|مصروف|Gasto|Despesa|Ausgabe|Spesa|支出|खर्च|Kharash
Expense recorded|Gharama imerekodiwa|Dépense enregistrée|تم تسجيل المصروف|Gasto registrado|Despesa registrada|Ausgabe erfasst|Spesa registrata|支出已记录|खर्च दर्ज हुआ|Kharashka waa la diiwaangeliyey
Float|Akiba ya fedha|Trésorerie|السيولة|Fondos|Caixa|Kassenbestand|Liquidità|资金|फ़्लोट|Lacagta hawlgalka
In|Ndani|Entrées|داخل|Entradas|Entradas|Ein|Entrate|收入|आया|Soo galay
Internet|Intaneti|Internet|الإنترنت|Internet|Internet|Internet|Internet|网络费|इंटरनेट|Internet
Items|Bidhaa|Articles|العناصر|Artículos|Itens|Artikel|Articoli|商品|वस्तुएँ|Alaabta
Journal|Daftari la kumbukumbu|Journal|دفتر اليومية|Diario|Diário|Journal|Libro giornale|日记账|जर्नल|Diiwaanka xisaabta
Liabilities|Madeni|Passifs|الالتزامات|Pasivos|Passivos|Verbindlichkeiten|Passività|负债|देनदारियाँ|Deymaha lagu leeyahay
M-Pesa|M-Pesa|M-Pesa|M-Pesa|M-Pesa|M-Pesa|M-Pesa|M-Pesa|M-Pesa|M-Pesa|M-Pesa
Money in and out|Pesa iliyoingia na kutoka|Entrées et sorties d'argent|الأموال الداخلة والخارجة|Dinero que entra y sale|Dinheiro que entra e sai|Geld rein und raus|Entrate e uscite|资金进出|पैसा आया और गया|Lacagta soo gasha iyo tan baxda
Move money|Hamisha pesa|Déplacer de l'argent|نقل الأموال|Mover dinero|Mover dinheiro|Geld bewegen|Sposta denaro|调拨资金|पैसा ले जाएँ|Wareeji lacag
Net profit|Faida halisi|Bénéfice net|صافي الربح|Beneficio neto|Lucro líquido|Nettogewinn|Utile netto|净利润|शुद्ध लाभ|Faa'iidada saafiga ah
New purchase|Manunuzi mapya|Nouvel achat|شراء جديد|Nueva compra|Nova compra|Neuer Einkauf|Nuovo acquisto|新采购|नई खरीद|Iibsi cusub
No expenses yet|Hakuna gharama bado|Aucune dépense|لا توجد مصروفات بعد|Aún no hay gastos|Nenhuma despesa ainda|Noch keine Ausgaben|Nessuna spesa|暂无支出|अभी कोई खर्च नहीं|Weli kharash ma jiro
No purchases yet|Hakuna manunuzi bado|Aucun achat|لا توجد مشتريات بعد|Aún no hay compras|Nenhuma compra ainda|Noch keine Einkäufe|Nessun acquisto|暂无采购|अभी कोई खरीद नहीं|Weli iibsi ma jiro
No records yet|Hakuna rekodi bado|Aucun enregistrement|لا توجد سجلات بعد|Aún no hay registros|Nenhum registro ainda|Noch keine Einträge|Nessun record|暂无记录|अभी कोई रिकॉर्ड नहीं|Weli diiwaanno ma jiraan
No supplier|Hakuna msambazaji|Aucun fournisseur|بدون مورد|Sin proveedor|Sem fornecedor|Kein Lieferant|Nessun fornitore|无供应商|कोई आपूर्तिकर्ता नहीं|Alaab-qeybiye ma jiro
No suppliers yet|Hakuna wasambazaji bado|Aucun fournisseur|لا يوجد موردون بعد|Aún no hay proveedores|Nenhum fornecedor ainda|Noch keine Lieferanten|Nessun fornitore|暂无供应商|अभी कोई आपूर्तिकर्ता नहीं|Weli ma jiraan alaab-qeybiyeyaal
Note (optional)|Maelezo (si lazima)|Note (facultatif)|ملاحظة (اختياري)|Nota (opcional)|Nota (opcional)|Notiz (optional)|Nota (facoltativa)|备注（可选）|नोट (वैकल्पिक)|Qoraal (ikhtiyaari)
Orders|Oda|Commandes|الطلبات|Pedidos|Pedidos|Bestellungen|Ordini|订单|ऑर्डर|Dalabyo
Owed to supplier|Deni kwa msambazaji|Dû au fournisseur|مستحق للمورد|Debido al proveedor|Devido ao fornecedor|Lieferant geschuldet|Dovuto al fornitore|欠供应商|आपूर्तिकर्ता का बकाया|Deynta alaab-qeybiyaha
Owner equity|Mtaji wa mmiliki|Capital du propriétaire|حقوق المالك|Capital del propietario|Capital do proprietário|Eigenkapital des Inhabers|Capitale del titolare|所有者权益|मालिक की पूंजी|Raasamaalka milkiilaha
Pay supplier|Lipa msambazaji|Payer le fournisseur|الدفع للمورد|Pagar al proveedor|Pagar fornecedor|Lieferant bezahlen|Paga fornitore|支付供应商|आपूर्तिकर्ता को भुगतान|Bixi alaab-qeybiyaha
Payroll payment|Malipo ya mishahara|Paiement des salaires|دفع الرواتب|Pago de nómina|Pagamento da folha|Lohnzahlung|Pagamento stipendi|工资支付|वेतन भुगतान|Bixinta mushaharka
Product not found. Add it in Inventory first.|Bidhaa haikupatikana. Iongeze kwanza kwenye Stoo.|Produit introuvable. Ajoutez-le d'abord dans l'inventaire.|المنتج غير موجود. أضفه أولاً في المخزون.|Producto no encontrado. Añádelo primero en Inventario.|Produto não encontrado. Adicione primeiro no Estoque.|Produkt nicht gefunden. Zuerst im Lager anlegen.|Prodotto non trovato. Aggiungilo prima in Inventario.|未找到商品。请先在库存中添加。|उत्पाद नहीं मिला। पहले इन्वेंटरी में जोड़ें।|Alaabta lama helin. Marka hore ku dar Kaydka.
Profit & loss|Faida na hasara|Compte de résultat|الأرباح والخسائر|Pérdidas y ganancias|Lucros e perdas|Gewinn und Verlust|Conto economico|损益表|लाभ और हानि|Faa'iido iyo khasaare
Purchase recorded|Manunuzi yamerekodiwa|Achat enregistré|تم تسجيل الشراء|Compra registrada|Compra registrada|Einkauf erfasst|Acquisto registrato|采购已记录|खरीद दर्ज हुई|Iibsashada waa la diiwaangeliyey
Receive payment|Pokea malipo|Encaisser|استلام دفعة|Recibir pago|Receber pagamento|Zahlung erhalten|Incassa pagamento|收款|भुगतान लें|Hel lacag
Reduce amount owed|Punguza deni|Réduire le montant dû|تخفيض المبلغ المستحق|Reducir lo adeudado|Reduzir valor devido|Schuld verringern|Riduci il dovuto|减少欠款|बकाया घटाएँ|Yaree deynta
Rent|Kodi ya nyumba|Loyer|الإيجار|Alquiler|Aluguel|Miete|Affitto|租金|किराया|Kiro
Repairs|Matengenezo|Réparations|الإصلاحات|Reparaciones|Reparos|Reparaturen|Riparazioni|维修|मरम्मत|Dayactir
Retained profit|Faida iliyobaki|Bénéfices non distribués|الأرباح المحتجزة|Beneficio retenido|Lucro retido|Einbehaltener Gewinn|Utile trattenuto|留存利润|प्रतिधारित लाभ|Faa'iidada la reebay
Return to supplier|Rudisha kwa msambazaji|Retour au fournisseur|إرجاع إلى المورد|Devolver al proveedor|Devolver ao fornecedor|An Lieferant zurück|Reso al fornitore|退货给供应商|आपूर्तिकर्ता को वापसी|Ku celi alaab-qeybiyaha
Supplier payment|Malipo kwa msambazaji|Paiement fournisseur|دفعة للمورد|Pago a proveedor|Pagamento a fornecedor|Lieferantenzahlung|Pagamento fornitore|供应商付款|आपूर्तिकर्ता भुगतान|Lacag-bixinta alaab-qeybiyaha
Supplier refund|Marejesho kutoka kwa msambazaji|Remboursement fournisseur|استرداد من المورد|Reembolso de proveedor|Reembolso do fornecedor|Lieferantenerstattung|Rimborso fornitore|供应商退款|आपूर्तिकर्ता धनवापसी|Lacag-celinta alaab-qeybiyaha
Salaries & commission|Mishahara na kamisheni|Salaires et commissions|الرواتب والعمولات|Salarios y comisiones|Salários e comissões|Löhne und Provisionen|Stipendi e provvigioni|工资和佣金|वेतन और कमीशन|Mushahar iyo gunno
Salaries payable|Mishahara inayodaiwa|Salaires à payer|رواتب مستحقة|Salarios por pagar|Salários a pagar|Offene Löhne|Stipendi da pagare|应付工资|देय वेतन|Mushaharka la bixinayo
Save expense|Hifadhi gharama|Enregistrer la dépense|حفظ المصروف|Guardar gasto|Salvar despesa|Ausgabe speichern|Salva spesa|保存支出|खर्च सहेजें|Kaydi kharashka
Search or scan products to add|Tafuta au skani bidhaa kuongeza|Recherchez ou scannez des produits|ابحث أو امسح المنتجات لإضافتها|Busca o escanea productos para añadir|Pesquise ou escaneie produtos|Produkte suchen oder scannen|Cerca o scansiona prodotti|搜索或扫描商品添加|जोड़ने के लिए उत्पाद खोजें या स्कैन करें|Raadi ama iskaan garee alaab aad ku darto
Statement|Taarifa ya akaunti|Relevé|كشف الحساب|Estado de cuenta|Extrato|Kontoauszug|Estratto conto|对账单|विवरण|Warbixin xisaabeed
Statements|Taarifa za akaunti|Relevés|كشوف الحساب|Estados de cuenta|Extratos|Kontoauszüge|Estratti conto|对账单|विवरण|Warbixinno xisaabeed
Stock adjustments|Marekebisho ya stoo|Ajustements de stock|تسويات المخزون|Ajustes de inventario|Ajustes de estoque|Bestandskorrekturen|Rettifiche magazzino|库存调整|स्टॉक समायोजन|Hagaajinta kaydka
Supplier|Msambazaji|Fournisseur|المورد|Proveedor|Fornecedor|Lieferant|Fornitore|供应商|आपूर्तिकर्ता|Alaab-qeybiye
Supplier added|Msambazaji ameongezwa|Fournisseur ajouté|تمت إضافة المورد|Proveedor añadido|Fornecedor adicionado|Lieferant hinzugefügt|Fornitore aggiunto|已添加供应商|आपूर्तिकर्ता जोड़ा गया|Alaab-qeybiye waa lagu daray
Supplier name|Jina la msambazaji|Nom du fournisseur|اسم المورد|Nombre del proveedor|Nome do fornecedor|Lieferantenname|Nome fornitore|供应商名称|आपूर्तिकर्ता का नाम|Magaca alaab-qeybiyaha
Suppliers|Wasambazaji|Fournisseurs|الموردون|Proveedores|Fornecedores|Lieferanten|Fornitori|供应商|आपूर्तिकर्ता|Alaab-qeybiyeyaal
Supplies|Vifaa|Fournitures|اللوازم|Suministros|Suprimentos|Verbrauchsmaterial|Forniture|耗材|सामग्री|Agab
Top category|Aina kuu|Catégorie principale|الفئة الأعلى|Categoría principal|Categoria principal|Top-Kategorie|Categoria principale|最大类别|शीर्ष श्रेणी|Qaybta ugu sarreysa
Transfer|Hamisho|Virement|تحويل|Transferencia|Transferência|Überweisung|Trasferimento|转账|स्थानांतरण|Wareejin
Transfer between accounts|Hamisha kati ya akaunti|Virement entre comptes|تحويل بين الحسابات|Transferir entre cuentas|Transferir entre contas|Zwischen Konten übertragen|Trasferisci tra conti|账户间转账|खातों के बीच स्थानांतरण|Lacag u kala wareeji akoonnada
Transfer recorded|Hamisho limerekodiwa|Virement enregistré|تم تسجيل التحويل|Transferencia registrada|Transferência registrada|Überweisung erfasst|Trasferimento registrato|转账已记录|स्थानांतरण दर्ज हुआ|Wareejinta waa la diiwaangeliyey
Transport|Usafiri|Transport|النقل|Transporte|Transporte|Transport|Trasporto|交通|परिवहन|Gaadiid
Trial balance|Mizani ya majaribio|Balance de vérification|ميزان المراجعة|Balance de comprobación|Balancete|Saldenbilanz|Bilancio di verifica|试算平衡表|तलपट|Miisaanka tijaabada
Update product buying price|Sasisha bei ya kununua|Mettre à jour le prix d'achat|تحديث سعر الشراء|Actualizar precio de compra|Atualizar preço de compra|Einkaufspreis aktualisieren|Aggiorna prezzo d'acquisto|更新进货价|खरीद मूल्य अपडेट करें|Cusboonaysii qiimaha iibsiga alaabta
Water|Maji|Eau|الماء|Agua|Água|Wasser|Acqua|水费|पानी|Biyo
Withdrawal|Toa|Retrait|سحب|Retiro|Saque|Abhebung|Prelievo|取出|निकासी|Lacag la bixid
Books balance|Hesabu zinalingana|Les comptes sont équilibrés|الدفاتر متوازنة|Los libros cuadran|Os livros fecham|Bücher sind ausgeglichen|I conti quadrano|账目平衡|खाते संतुलित हैं|Xisaabaadku way isu dheellitiran yihiin
Books do not balance|Hesabu hazilingani|Les comptes ne sont pas équilibrés|الدفاتر غير متوازنة|Los libros no cuadran|Os livros não fecham|Bücher nicht ausgeglichen|I conti non quadrano|账目不平衡|खाते संतुलित नहीं हैं|Xisaabaadku isma dheellitirna
Camera permission is needed for barcode scanning. Allow camera access in your browser settings, or type the barcode or search instead.|Ruhusa ya kamera inahitajika kuskani msimbopau. Ruhusu kamera kwenye mipangilio ya kivinjari, au andika msimbopau au tafuta.|L'accès à la caméra est nécessaire pour scanner. Autorisez-le dans les réglages du navigateur, ou saisissez le code-barres ou recherchez.|يلزم إذن الكاميرا لمسح الباركود. اسمح بالوصول في إعدادات المتصفح، أو اكتب الباركود أو ابحث.|Se necesita permiso de cámara para escanear. Permítelo en los ajustes del navegador, o escribe el código o busca.|É preciso permissão da câmera para escanear. Permita nas configurações do navegador, ou digite o código ou pesquise.|Für das Scannen ist Kamerazugriff nötig. Erlauben Sie ihn in den Browsereinstellungen oder geben Sie den Barcode ein bzw. suchen Sie.|Serve il permesso della fotocamera per scansionare. Consentilo nelle impostazioni del browser, oppure digita il codice o cerca.|扫码需要相机权限。请在浏览器设置中允许，或手动输入条码或搜索。|बारकोड स्कैन के लिए कैमरा अनुमति चाहिए। ब्राउज़र सेटिंग्स में अनुमति दें, या बारकोड लिखें या खोजें।|Iskaanka barcode-ku wuxuu u baahan yahay oggolaanshaha kamaradda. Ka oggolow dejimaha biraawsarka, ama qor barcode-ka ama raadi.
Enter a supplier name|Weka jina la msambazaji|Saisissez un nom de fournisseur|أدخل اسم المورد|Introduce un nombre de proveedor|Informe o nome do fornecedor|Lieferantennamen eingeben|Inserisci il nome del fornitore|请输入供应商名称|आपूर्तिकर्ता का नाम दर्ज करें|Geli magaca alaab-qeybiyaha
Add products to the purchase|Ongeza bidhaa kwenye manunuzi|Ajoutez des produits à l'achat|أضف منتجات إلى الشراء|Añade productos a la compra|Adicione produtos à compra|Produkte zum Einkauf hinzufügen|Aggiungi prodotti all'acquisto|请向采购单添加商品|खरीद में उत्पाद जोड़ें|Alaab ku dar iibsashada
Credit needs a supplier|Mkopo unahitaji msambazaji|Le crédit nécessite un fournisseur|الآجل يتطلب موردًا|El crédito requiere un proveedor|Crédito exige um fornecedor|Kredit erfordert einen Lieferanten|Il credito richiede un fornitore|赊购需要选择供应商|उधार के लिए आपूर्तिकर्ता चाहिए|Deyntu waxay u baahan tahay alaab-qeybiye
Supplier credit needs a supplier|Mkopo wa msambazaji unahitaji msambazaji|Le crédit fournisseur nécessite un fournisseur|رصيد المورد يتطلب موردًا|El crédito del proveedor requiere un proveedor|Crédito do fornecedor exige um fornecedor|Lieferantengutschrift erfordert Lieferanten|Il credito fornitore richiede un fornitore|供应商抵扣需要供应商|आपूर्तिकर्ता क्रेडिट के लिए आपूर्तिकर्ता चाहिए|Deynta alaab-qeybiyaha waxay u baahan tahay alaab-qeybiye
Choose a category|Chagua aina|Choisissez une catégorie|اختر فئة|Elige una categoría|Escolha uma categoria|Kategorie wählen|Scegli una categoria|请选择类别|श्रेणी चुनें|Dooro qayb
Category already exists|Aina tayari ipo|La catégorie existe déjà|الفئة موجودة بالفعل|La categoría ya existe|A categoria já existe|Kategorie existiert bereits|La categoria esiste già|类别已存在|श्रेणी पहले से है|Qaybtu hore ayay u jirtaa
Choose two different accounts|Chagua akaunti mbili tofauti|Choisissez deux comptes différents|اختر حسابين مختلفين|Elige dos cuentas distintas|Escolha duas contas diferentes|Zwei verschiedene Konten wählen|Scegli due conti diversi|请选择两个不同账户|दो अलग खाते चुनें|Dooro laba akoon oo kala duwan
Not enough money in M-Pesa|Pesa haitoshi kwenye M-Pesa|Fonds insuffisants sur M-Pesa|لا يوجد رصيد كافٍ في M-Pesa|Saldo insuficiente en M-Pesa|Saldo insuficiente no M-Pesa|Nicht genug Geld auf M-Pesa|Fondi insufficienti su M-Pesa|M-Pesa 余额不足|M-Pesa में पर्याप्त पैसा नहीं|Lacag ku filan kuma jirto M-Pesa
Not enough money in Bank|Pesa haitoshi benki|Fonds insuffisants en banque|لا يوجد رصيد كافٍ في البنك|Saldo insuficiente en el banco|Saldo insuficiente no banco|Nicht genug Geld auf der Bank|Fondi insufficienti in banca|银行余额不足|बैंक में पर्याप्त पैसा नहीं|Lacag ku filan kuma jirto bangiga
Purchase not found|Manunuzi hayakupatikana|Achat introuvable|الشراء غير موجود|Compra no encontrada|Compra não encontrada|Einkauf nicht gefunden|Acquisto non trovato|未找到采购单|खरीद नहीं मिली|Iibsashada lama helin
Supplier not found|Msambazaji hakupatikana|Fournisseur introuvable|المورد غير موجود|Proveedor no encontrado|Fornecedor não encontrado|Lieferant nicht gefunden|Fornitore non trovato|未找到供应商|आपूर्तिकर्ता नहीं मिला|Alaab-qeybiyaha lama helin
`.trim().split('\n').map(row => row.split('|'));

const dictionary = new Map(rows.map(row => [(row[0] ?? '').toLowerCase(), row]));
export function translateText(lang: Lang, text: string, x?: string | number) {
  const patterns: [RegExp, string, string[]][] = [
    [/^Not enough stock for (.+) \(available (.+)\)$/, 'Not enough stock for {name} (available {qty})', ['name', 'qty']],
    [/^Insufficient stock: (.+) \(available (.+)\)$/, 'Insufficient stock: {name} (available {qty})', ['name', 'qty']],
    [/^Invalid quantity for (.+)$/, 'Invalid quantity for {name}', ['name']],
    [/^Only (.+) of (.+) can be returned$/, 'Only {qty} of {name} can be returned', ['qty', 'name']],
  ];
  for (const [pattern, key, fields] of patterns) {
    const match = text.match(pattern);
    if (match) { let value = dictionary.get(key.toLowerCase())?.[LANGS.indexOf(lang)] ?? key; fields.forEach((field, index) => { value = value.replace(`{${field}}`, match[index + 1] ?? ''); }); return value; }
  }
  const translated = dictionary.get(text.toLowerCase())?.[LANGS.indexOf(lang)] ?? text;
  return x === undefined ? translated : translated.replace('{x}', String(x));
}

export function translateCurrent(text: string) {
  const saved = typeof window === 'undefined' ? 'English' : localStorage.getItem('shopbook.language');
  const lang = LANGS.find(l => l === saved) ?? 'English';
  return translateText(lang, text);
}
