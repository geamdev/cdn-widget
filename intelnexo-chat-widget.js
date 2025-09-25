/**
 * Intelnexo Chat Widget - CDN Version
 * Widget flotante para chat con IA que se puede incluir en cualquier página
 *
 * Uso:
 * <script src="https://cdn.intelnexo.com/widgets/chat.js"></script>
 * <script>
 *   IntelnexoChat.init({
 *     brainApiUrl: 'https://dev.intelnexo.com/brain-api/v1/chat/1/902391032',
 *     agentId: 'asdfa',
 *     userId: 'user_123',
 *     userName: 'Usuario'
 *   });
 * </script>
 */

(function () {
  'use strict';

  // Configuración por defecto
  const DEFAULT_CONFIG = {
    brainApiUrl: 'https://app.intelnexo.com/dialer-api/v1/brain-proxy/chat',
    agentId: 'agent-9e1c3779-d9db-4bc8-892e-76323635c218',
    userId: 'user_123',
    userName: 'Usuario',
    position: 'bottom-right',
    theme: 'green',
    language: 'es',
    // Colores personalizables - VALORES POR DEFECTO
    primaryColor: '#25d366',
    secondaryColor: '#1ea952',
    textColor: '#333333',
    backgroundColor: '#ffffff',
    userMessageColor: '#007bff',
    agentMessageColor: '#f8f9fa',
    // Colores específicos - VALORES POR DEFECTO
    buttonColor: '#25d366',
    buttonTextColor: 'white',
    buttonShadowColor: 'rgba(37, 211, 102, 0.3)',
    buttonShadowHoverColor: 'rgba(37, 211, 102, 0.4)',
    headerColor: '#25d366',
    sendButtonColor: '#25d366',
    sendButtonHoverColor: '#1ea952',
    inputFocusColor: '#25d366',
    inputBorderColor: '#ddd',
    // Tamaños personalizables
    widgetSize: '350px',
    buttonSize: '60px',
    borderRadius: '12px',
  };

  // Función para leer parámetros de URL
  function getUrlParams() {
    const params = {};
    const urlParams = new URLSearchParams(window.location.search);

    for (const [key, value] of urlParams) {
      // Convertir colores (remover # si viene con %23)
      if (key.includes('Color') && value.startsWith('%23')) {
        params[key] = '#' + value.substring(3);
      } else {
        params[key] = value;
      }
    }

    return params;
  }

  // Clase principal del widget
  class IntelnexoChat {
    constructor(config = {}) {
      // Combinar configuración por defecto, parámetros de URL y configuración manual
      const urlParams = getUrlParams();
      this.config = { ...DEFAULT_CONFIG, ...urlParams, ...config };
      this.isOpen = false;
      this.isConnected = false;
      this.sessionId = this.generateSessionId();
      this.userId = this.config.userId || this.generateUserId();

      this.init();
    }

    generateUserId() {
      return 'user_' + Math.random().toString(36).substr(2, 9);
    }

    generateSessionId() {
      return 'session_' + Math.random().toString(36).substr(2, 9);
    }

    init() {
      this.createWidget();
      this.bindEvents();
      this.connect();
    }

    createWidget() {
      // Crear contenedor principal
      this.container = document.createElement('div');
      this.container.id = 'intelnexo-chat-widget';
      this.container.innerHTML = this.getWidgetHTML();

      // Agregar estilos
      this.addStyles();

      // Agregar al DOM
      document.body.appendChild(this.container);

      // Obtener referencias a elementos
      this.toggle = this.container.querySelector('#intelnexo-chat-toggle');
      this.widget = this.container.querySelector(
        '#intelnexo-chat-widget-panel'
      );
      this.messages = this.container.querySelector('#intelnexo-chat-messages');
      this.input = this.container.querySelector('#intelnexo-chat-input');
      this.sendBtn = this.container.querySelector('#intelnexo-chat-send');
      this.status = this.container.querySelector('#intelnexo-chat-status');
      this.typingIndicator = this.container.querySelector(
        '#intelnexo-chat-typing'
      );
    }

    getWidgetHTML() {
      return `
        <!-- Botón flotante -->
        <button id="intelnexo-chat-toggle" class="intelnexo-chat-toggle">
          💬
        </button>

        <!-- Panel de chat -->
        <div id="intelnexo-chat-widget-panel" class="intelnexo-chat-widget">
          <!-- Header -->
          <div class="intelnexo-chat-header">
            <div>
              <h3>💬 Chat con IA</h3>
              <div id="intelnexo-chat-status" class="intelnexo-chat-status disconnected">
                Conectando...
              </div>
            </div>
          </div>

          <!-- Mensajes -->
          <div id="intelnexo-chat-messages" class="intelnexo-chat-messages">
            <div class="intelnexo-message system">
              ¡Hola! ¿En qué puedo ayudarte hoy?
            </div>
          </div>

          <!-- Indicador de escritura -->
          <div id="intelnexo-chat-typing" class="intelnexo-chat-typing">
            <span>IA está escribiendo</span>
            <div class="intelnexo-typing-dots">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>

          <!-- Input -->
          <div class="intelnexo-chat-input-area">
            <div class="intelnexo-chat-input-group">
              <input 
                type="text" 
                id="intelnexo-chat-input" 
                class="intelnexo-chat-input" 
                placeholder="Pregúntame lo que quieras..."
                disabled
              />
              <button id="intelnexo-chat-send" class="intelnexo-chat-send-btn" disabled>
                ➤
              </button>
            </div>
          </div>
        </div>
      `;
    }

    addStyles() {
      if (document.getElementById('intelnexo-chat-styles')) return;

      const style = document.createElement('style');
      style.id = 'intelnexo-chat-styles';
      style.textContent = `
        /* Widget Flotante */
        #intelnexo-chat-widget {
          position: fixed;
          bottom: 20px;
          right: 20px;
          z-index: 999999;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        .intelnexo-chat-toggle {
          width: ${this.config.buttonSize};
          height: ${this.config.buttonSize};
          background: ${this.config.buttonColor || this.config.primaryColor};
          border: none;
          border-radius: 50%;
          color: ${this.config.buttonTextColor || 'white'};
          font-size: 24px;
          cursor: pointer;
          box-shadow: 0 4px 16px ${
            this.config.buttonShadowColor || 'rgba(37, 211, 102, 0.3)'
          };
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .intelnexo-chat-toggle:hover {
          transform: scale(1.1);
          box-shadow: 0 6px 20px ${
            this.config.buttonShadowHoverColor || 'rgba(37, 211, 102, 0.4)'
          };
        }

        .intelnexo-chat-widget {
          position: fixed;
          bottom: 90px;
          right: 20px;
          width: ${this.config.widgetSize};
          height: 500px;
          background: ${this.config.backgroundColor};
          border-radius: ${this.config.borderRadius};
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
          display: none;
          flex-direction: column;
          z-index: 1000000;
        }

        .intelnexo-chat-widget.open {
          display: flex;
        }

        .intelnexo-chat-header {
          background: ${this.config.headerColor || this.config.primaryColor};
          color: white;
          padding: 16px 20px;
          border-radius: 12px 12px 0 0;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .intelnexo-chat-header h3 {
          margin: 0;
          font-size: 16px;
          font-weight: 600;
        }

        .intelnexo-chat-status {
          font-size: 12px;
          opacity: 0.9;
        }

        .intelnexo-chat-status.connected {
          color: #90ee90;
        }

        .intelnexo-chat-status.disconnected {
          color: #ffb6c1;
        }

        .intelnexo-chat-messages {
          flex: 1;
          padding: 16px;
          overflow-y: auto;
          background: #f8f9fa;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .intelnexo-message {
          max-width: 80%;
          padding: 12px 16px;
          border-radius: 18px;
          font-size: 14px;
          line-height: 1.4;
          word-wrap: break-word;
        }

        .intelnexo-message.user {
          background: ${
            this.config.userMessageColor || this.config.primaryColor
          };
          color: white;
          align-self: flex-end;
          border-bottom-right-radius: 4px;
        }

        .intelnexo-message.agent {
          background: ${this.config.agentMessageColor || '#f8f9fa'};
          color: ${this.config.textColor || '#333333'};
          align-self: flex-start;
          border: 1px solid #e9ecef;
          border-bottom-left-radius: 4px;
        }

        .intelnexo-message.system {
          background: #fff3cd;
          color: #856404;
          align-self: center;
          text-align: center;
          font-size: 12px;
          font-style: italic;
          border-radius: 8px;
        }

        .intelnexo-chat-input-area {
          padding: 16px;
          background: white;
          border-top: 1px solid #e9ecef;
          border-radius: 0 0 12px 12px;
        }

        .intelnexo-chat-input-group {
          display: flex;
          gap: 8px;
        }

        .intelnexo-chat-input {
          flex: 1;
          padding: 12px 16px;
          border: 1px solid ${this.config.inputBorderColor || '#ddd'};
          border-radius: 24px;
          font-size: 14px;
          outline: none;
          transition: border-color 0.3s ease;
        }

        .intelnexo-chat-input:focus {
          border-color: ${
            this.config.inputFocusColor || this.config.primaryColor
          };
        }

        .intelnexo-chat-send-btn {
          width: 44px;
          height: 44px;
          background: ${
            this.config.sendButtonColor || this.config.primaryColor
          };
          border: none;
          border-radius: 50%;
          color: white;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.3s ease;
        }

        .intelnexo-chat-send-btn:hover:not(:disabled) {
          background: ${
            this.config.sendButtonHoverColor || this.config.secondaryColor
          };
        }

        .intelnexo-chat-send-btn:disabled {
          background: #6c757d;
          cursor: not-allowed;
        }

        .intelnexo-chat-typing {
          display: none;
          align-items: center;
          gap: 8px;
          color: #666;
          font-size: 12px;
          font-style: italic;
          padding: 0 16px;
        }

        .intelnexo-typing-dots {
          display: flex;
          gap: 2px;
        }

        .intelnexo-typing-dots span {
          width: 4px;
          height: 4px;
          background: #666;
          border-radius: 50%;
          animation: intelnexo-typing 1.4s infinite;
        }

        .intelnexo-typing-dots span:nth-child(2) {
          animation-delay: 0.2s;
        }

        .intelnexo-typing-dots span:nth-child(3) {
          animation-delay: 0.4s;
        }

        @keyframes intelnexo-typing {
          0%, 60%, 100% {
            transform: translateY(0);
          }
          30% {
            transform: translateY(-10px);
          }
        }

        /* Responsive */
        @media (max-width: 480px) {
          .intelnexo-chat-widget {
            width: 100vw;
            height: 100vh;
            bottom: 0;
            right: 0;
            border-radius: 0;
          }
        }

        /* Animaciones */
        .intelnexo-chat-widget {
          animation: intelnexo-slideUp 0.3s ease-out;
        }

        @keyframes intelnexo-slideUp {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
      `;

      document.head.appendChild(style);
    }

    bindEvents() {
      this.toggle.addEventListener('click', () => this.toggleChat());
      this.sendBtn.addEventListener('click', () => this.sendMessage());
      this.input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') this.sendMessage();
      });
    }

    toggleChat() {
      this.isOpen = !this.isOpen;

      if (this.isOpen) {
        this.widget.classList.add('open');
        this.input.focus();
      } else {
        this.widget.classList.remove('open');
      }
    }

    async connect() {
      try {
        this.updateStatus('Conectando...', 'disconnected');

        // Simular conexión
        await new Promise((resolve) => setTimeout(resolve, 1000));

        this.isConnected = true;
        this.updateStatus('Conectado', 'connected');
        this.enableInput();
        this.addMessage('¡Conectado! ¿En qué puedo ayudarte?', 'system');
      } catch (error) {
        console.error('Error conectando:', error);
        this.updateStatus('Error de conexión', 'disconnected');
        this.addMessage(
          'Error de conexión. Intenta recargar la página.',
          'system'
        );
      }
    }

    async sendMessage() {
      const content = this.input.value.trim();
      if (!content || !this.isConnected) return;

      this.addMessage(content, 'user');
      this.input.value = '';

      try {
        this.showTypingIndicator();

        // Llamar a Brain API via proxy seguro
        const response = await fetch(this.config.brainApiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: content,
            user_id: this.userId,
            session_id: this.sessionId,
            agent_id: this.config.agentId,
            metadata: {
              source: 'web_widget',
              page_url: window.location.href,
              user_agent: navigator.userAgent,
            },
          }),
        });

        if (response.ok) {
          const data = await response.json();
          this.hideTypingIndicator();
          this.addMessage(data.response || 'Gracias por tu mensaje.', 'agent');
        } else {
          throw new Error(`Error ${response.status}`);
        }
      } catch (error) {
        console.error('Error enviando mensaje:', error);
        this.hideTypingIndicator();
        this.addMessage('Error enviando mensaje. Intenta de nuevo.', 'system');
      }
    }

    addMessage(content, sender) {
      const messageDiv = document.createElement('div');
      messageDiv.className = `intelnexo-message ${sender}`;
      messageDiv.textContent = content;
      this.messages.appendChild(messageDiv);
      this.scrollToBottom();
    }

    updateStatus(text, status) {
      this.status.textContent = text;
      this.status.className = `intelnexo-chat-status ${status}`;
    }

    enableInput() {
      this.input.disabled = false;
      this.sendBtn.disabled = false;
    }

    showTypingIndicator() {
      this.typingIndicator.style.display = 'flex';
      this.scrollToBottom();
    }

    hideTypingIndicator() {
      this.typingIndicator.style.display = 'none';
    }

    scrollToBottom() {
      this.messages.scrollTop = this.messages.scrollHeight;
    }
  }

  // API pública
  window.IntelnexoChat = {
    init: function (config) {
      return new IntelnexoChat(config);
    },
  };

  // Auto-inicializar si hay configuración en el DOM
  document.addEventListener('DOMContentLoaded', function () {
    const script = document.querySelector('script[data-agent-id]');
    if (script) {
      const config = {
        brainApiUrl: script.dataset.brainApiUrl || DEFAULT_CONFIG.brainApiUrl,
        agentId: script.dataset.agentId || DEFAULT_CONFIG.agentId,
        userId: script.dataset.userId || DEFAULT_CONFIG.userId,
        userName: script.dataset.userName || DEFAULT_CONFIG.userName,
        // Colores personalizables
        primaryColor:
          script.dataset.primaryColor || DEFAULT_CONFIG.primaryColor,
        secondaryColor:
          script.dataset.secondaryColor || DEFAULT_CONFIG.secondaryColor,
        textColor: script.dataset.textColor || DEFAULT_CONFIG.textColor,
        backgroundColor:
          script.dataset.backgroundColor || DEFAULT_CONFIG.backgroundColor,
        userMessageColor:
          script.dataset.userMessageColor || DEFAULT_CONFIG.userMessageColor,
        agentMessageColor:
          script.dataset.agentMessageColor || DEFAULT_CONFIG.agentMessageColor,
        // Colores específicos
        buttonColor: script.dataset.buttonColor || DEFAULT_CONFIG.buttonColor,
        buttonTextColor:
          script.dataset.buttonTextColor || DEFAULT_CONFIG.buttonTextColor,
        buttonShadowColor:
          script.dataset.buttonShadowColor || DEFAULT_CONFIG.buttonShadowColor,
        buttonShadowHoverColor:
          script.dataset.buttonShadowHoverColor ||
          DEFAULT_CONFIG.buttonShadowHoverColor,
        headerColor: script.dataset.headerColor || DEFAULT_CONFIG.headerColor,
        sendButtonColor:
          script.dataset.sendButtonColor || DEFAULT_CONFIG.sendButtonColor,
        sendButtonHoverColor:
          script.dataset.sendButtonHoverColor ||
          DEFAULT_CONFIG.sendButtonHoverColor,
        inputFocusColor:
          script.dataset.inputFocusColor || DEFAULT_CONFIG.inputFocusColor,
        inputBorderColor:
          script.dataset.inputBorderColor || DEFAULT_CONFIG.inputBorderColor,
        // Tamaños
        widgetSize: script.dataset.widgetSize || DEFAULT_CONFIG.widgetSize,
        buttonSize: script.dataset.buttonSize || DEFAULT_CONFIG.buttonSize,
        borderRadius:
          script.dataset.borderRadius || DEFAULT_CONFIG.borderRadius,
      };

      window.intelnexoChatInstance = new IntelnexoChat(config);
    }
  });
})();
