# **CardCast - Seu Oráculo Digital Diário** 🔮✨

---

## **📌 Sobre o Projeto**
O **CardCast** é uma plataforma de tarô digital que oferece:
- Leituras diárias personalizadas
- Interpretações geradas por IA
- Experiência mística moderna

**Tecnologias Utilizadas**:
- Next.js (App Router)
- Supabase (Banco de dados)
- hCaptcha (Proteção contra bots)
- Resend (Envios de e-mail)
- Tailwind CSS (Estilização)

---

## **🚀 Como Rodar Localmente**

### **Pré-requisitos**
- Node.js 18+
- Conta no [Supabase](https://supabase.com/)
- Chaves do [hCaptcha](https://dashboard.hcaptcha.com/) (opcional)
- Conta no [Resend](https://resend.com/) (opcional para e-mails)

---

### **🔧 Configuração Inicial**

1. **Clone o repositório**
   ```bash
   git clone https://github.com/seu-usuario/cardcast.git
   cd cardcast
   ```

2. **Instale as dependências**
   ```bash
   npm install
   ```

3. **Configure as variáveis de ambiente**  
   Crie um arquivo `.env.local` na raiz do projeto:
   ```env
   # Supabase
   SUPABASE_URL=seu-url-supabase
   SUPABASE_KEY=seu-key-supabase

   # hCaptcha (opcional)
   NEXT_PUBLIC_HCAPTCHA_SITE_KEY=sua-chave-publica
   HCAPTCHA_SECRET=sua-chave-privada

   # Resend (opcional para e-mails)
   RESEND_API_KEY=sua-chave-resend
   NEXTAUTH_URL=http://localhost:3000
   ```

---

### **🖥️ Comandos Úteis**

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Inicia o servidor de desenvolvimento |
| `npm run build` | Gera a versão de produção |
| `npm start` | Roda a versão buildada |
| `npm run lint` | Verifica erros de código |

---

## **🌐 Acessando o Projeto**
Após iniciar o servidor, acesse:
```
http://localhost:3000
```

---

## **📦 Estrutura do Projeto**
```
cardcast/
├── app/
│   ├── (auth)/
│   ├── api/
│   ├── components/
│   └── page.jsx         # Página principal
├── lib/
│   └── supabase.js      # Conexão com o banco
├── public/              # Assets estáticos
└── styles/
    └── globals.css      # Estilos globais
```

---

## **🔒 Variáveis de Ambiente Obrigatórias**
| Variável | Descrição | Obrigatória? |
|----------|-----------|--------------|
| `SUPABASE_URL` | URL do projeto Supabase | ✅ |
| `SUPABASE_KEY` | Chave anônima do Supabase | ✅ |
| `NEXTAUTH_URL` | URL base da aplicação | ✅ |
| `NEXT_PUBLIC_HCAPTCHA_SITE_KEY` | Chave pública hCaptcha | ❌ |
| `HCAPTCHA_SECRET` | Chave privada hCaptcha | ❌ |
| `RESEND_API_KEY` | Chave da API Resend | ❌ |

---

## **🤝 Como Contribuir**
1. Faça um fork do projeto
2. Crie uma branch (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

---

## **📄 Licença**
Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

**✨ Desenvolvido com magia e código**  
Rodrigo Bravo • 2025