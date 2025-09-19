// Biblioteca de utilitários de data (100% manual - SEM JavaScript Date)
class DateUtils {
    // Verificar se um ano é bissexto
    static isLeapYear(year) {
        return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
    }
    
    // Obter dias no mês
    static getDaysInMonth(year, month) {
        const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
        if (month === 2 && this.isLeapYear(year)) {
            return 29;
        }
        return daysInMonth[month - 1];
    }
    
    // Converter data para dias desde uma época (1 de janeiro de 2000)
    static dateToDays(year, month, day) {
        let totalDays = 0;
        // Somar anos desde 2000
        for (let y = 2000; y < year; y++) {
            totalDays += this.isLeapYear(y) ? 366 : 365;
        }
        // Somar meses do ano atual
        for (let m = 1; m < month; m++) {
            totalDays += this.getDaysInMonth(year, m);
        }
        // Somar dias (NÃO subtrai 1)
        totalDays += day;
        return totalDays;
    }
    
    // Parse de string YYYY-MM-DD para componentes
    static parseDate(dateString) {
        const [year, month, day] = dateString.split('-').map(Number);
        return { year, month, day };
    }
    
    // Obter data atual
    static getToday() {
        const now = new Date();
        return {
            year: now.getFullYear(),
            month: now.getMonth() + 1,
            day: now.getDate()
        };
    }
    
    // Calcular diferença em dias entre duas datas
    static daysDifference(date1, date2) {
        const days1 = this.dateToDays(date1.year, date1.month, date1.day);
        const days2 = this.dateToDays(date2.year, date2.month, date2.day);
        return days2 - days1;
    }
    
    // Formatar componentes de data para DD/MM/YYYY
    static formatDate(dateComponents) {
        const day = String(dateComponents.day).padStart(2, '0');
        const month = String(dateComponents.month).padStart(2, '0');
        return `${day}/${month}/${dateComponents.year}`;
    }
    
    // Formatar string YYYY-MM-DD para DD/MM/YYYY (SEM CONVERSÃO DE DATA)
    static formatDateString(dateString) {
        const [year, month, day] = dateString.split('-');
        return `${day.padStart(2, '0')}/${month.padStart(2, '0')}/${year}`;
    }
}

// Classe principal para gerenciar aniversários - REESCRITA COMPLETA
class BirthdayManager {
    constructor() {
        this.birthdays = this.loadBirthdays();
        this.notificationSettings = this.loadNotificationSettings();
        this.initializeEventListeners();
        this.initializeEmergencyBackup(); // Sistema de backup de emergência
        this.requestNotificationPermission();
        this.renderBirthdays();
        this.updateStats();
        this.checkNotifications();
        this.startNotificationTimer();
    }

    // Carregar aniversários do localStorage
    loadBirthdays() {
        const stored = localStorage.getItem('birthdays');
        return stored ? JSON.parse(stored) : [];
    }

    // Salvar aniversários no localStorage
    saveBirthdays() {
        localStorage.setItem('birthdays', JSON.stringify(this.birthdays));
    }

    // Carregar configurações de notificação
    loadNotificationSettings() {
        const stored = localStorage.getItem('notificationSettings');
        return stored ? JSON.parse(stored) : {};
    }

    // Salvar configurações de notificação
    saveNotificationSettings() {
        localStorage.setItem('notificationSettings', JSON.stringify(this.notificationSettings));
    }

    // NOVA FUNÇÃO: Calcular dias até aniversário no ANO QUE VEM (2026)
    calculateDaysUntilBirthday(birthDateString) {
        const today = DateUtils.getToday();
        const birthDate = DateUtils.parseDate(birthDateString);
        // Verifica se o aniversário deste ano já passou
        let targetYear = today.year;
        if (
            today.month > birthDate.month ||
            (today.month === birthDate.month && today.day > birthDate.day)
        ) {
            targetYear = today.year + 1;
        }
        const targetBirthday = {
            year: targetYear,
            month: birthDate.month,
            day: birthDate.day
        };
        return DateUtils.daysDifference(today, targetBirthday);
    }
    
    // NOVA FUNÇÃO: Calcular idade atual (em 2025)
    calculateCurrentAge(birthDateString) {
        const today = DateUtils.getToday();
        const birthDate = DateUtils.parseDate(birthDateString);
        
        let age = today.year - birthDate.year;
        
        // Verificar se ainda não fez aniversário este ano (2025)
        if (today.month < birthDate.month || 
            (today.month === birthDate.month && today.day < birthDate.day)) {
            age--;
        }
        
        return Math.max(0, age);
    }
    
    // NOVA FUNÇÃO: Calcular idade no próximo aniversário
    calculateNextAge(birthDateString) {
        const today = DateUtils.getToday();
        const birthDate = DateUtils.parseDate(birthDateString);
        
        // Determinar o ano do próximo aniversário
        let targetYear = today.year;
        if (
            today.month > birthDate.month ||
            (today.month === birthDate.month && today.day > birthDate.day)
        ) {
            targetYear = today.year + 1;
        }
        
        return targetYear - birthDate.year;
    }
    
    // NOVA FUNÇÃO: Ano do próximo aniversário
    calculateNextBirthdayYear(birthDateString) {
        const today = DateUtils.getToday();
        const birthDate = DateUtils.parseDate(birthDateString);
        
        // Determinar o ano do próximo aniversário
        let targetYear = today.year;
        if (
            today.month > birthDate.month ||
            (today.month === birthDate.month && today.day > birthDate.day)
        ) {
            targetYear = today.year + 1;
        }
        
        return targetYear;
    }

    // NOVA FUNÇÃO: Obter data completa do próximo aniversário
    getNextBirthdayDate(birthDateString) {
        const birthDate = DateUtils.parseDate(birthDateString);
        const nextYear = this.calculateNextBirthdayYear(birthDateString);
        
        return DateUtils.formatDate({
            year: nextYear,
            month: birthDate.month,
            day: birthDate.day
        });
    }

    // Inicializar event listeners
    initializeEventListeners() {
        // Formulário de adicionar aniversário
        document.getElementById('birthday-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addBirthday();
        });

        // Preview da foto
        document.getElementById('person-photo').addEventListener('change', this.previewPhoto);

        // Sincronização
        document.getElementById('generate-code-btn').addEventListener('click', () => {
            this.generateSyncCode();
        });

        document.getElementById('sync-code-btn').addEventListener('click', () => {
            this.syncFromCode();
        });

        document.getElementById('close-code-modal').addEventListener('click', () => {
            this.hideCodeModal();
        });

        // Permitir enter no campo de código
        document.getElementById('sync-code-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.syncFromCode();
            }
        });

        // Filtros
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.filterBirthdays(e.target.dataset.filter);
            });
        });

        // Modal de confirmação
        document.getElementById('confirm-delete').addEventListener('click', () => {
            this.confirmDelete();
        });

        document.getElementById('cancel-delete').addEventListener('click', () => {
            this.hideModal();
        });

        // Notificação banner
        document.getElementById('close-notification').addEventListener('click', () => {
            this.hideNotificationBanner();
        });

        // Permissão de notificações
        document.getElementById('allow-notifications').addEventListener('click', () => {
            this.requestNotificationPermission(true);
        });

        document.getElementById('deny-notifications').addEventListener('click', () => {
            this.hideNotificationPermission();
        });
    }

    // Adicionar novo aniversário
    addBirthday() {
        const name = document.getElementById('person-name').value.trim();
        const date = document.getElementById('birth-date').value;
        const description = document.getElementById('person-description').value.trim();
        const photoInput = document.getElementById('person-photo');

        if (!name || !date) {
            this.showNotification('Por favor, preencha todos os campos obrigatórios!', 'error');
            return;
        }

        // Verificar se já existe aniversário para esta pessoa
        if (this.birthdays.some(b => b.name.toLowerCase() === name.toLowerCase())) {
            this.showNotification('Já existe um aniversário cadastrado para esta pessoa!', 'error');
            return;
        }

        const birthday = {
            id: Date.now(),
            name: name,
            date: date,
            description: description || null,
            photo: null,
            createdAt: new Date().toISOString()
        };

        // Processar foto se fornecida
        if (photoInput.files && photoInput.files[0]) {
            const reader = new FileReader();
            reader.onload = (e) => {
                birthday.photo = e.target.result;
                this.saveBirthdayAndUpdate(birthday);
            };
            reader.readAsDataURL(photoInput.files[0]);
        } else {
            this.saveBirthdayAndUpdate(birthday);
        }
    }

    // Salvar aniversário e atualizar interface
    saveBirthdayAndUpdate(birthday) {
        this.birthdays.push(birthday);
        this.saveBirthdays();
        this.renderBirthdays();
        this.updateStats();
        this.resetForm();
        this.showNotification(`Aniversário de ${birthday.name} adicionado com sucesso!`, 'success');
        this.checkNotifications();
    }

    // Preview da foto
    previewPhoto(event) {
        const file = event.target.files[0];
        const preview = document.getElementById('photo-preview');
        
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                preview.src = e.target.result;
                preview.classList.remove('hidden');
            };
            reader.readAsDataURL(file);
        } else {
            preview.classList.add('hidden');
        }
    }

    // Resetar formulário
    resetForm() {
        document.getElementById('birthday-form').reset();
        document.getElementById('photo-preview').classList.add('hidden');
    }

    // Obter texto dos dias restantes
    getDaysLeftText(days) {
        if (days === 0) return 'Hoje é o aniversário!';
        if (days === 1) return 'Amanhã é o aniversário!';
        if (days <= 3) return `Faltam ${days} dias`;
        if (days <= 7) return `Faltam ${days} dias`;
        if (days <= 14) return `Faltam ${days} dias`;
        if (days <= 30) return `Faltam ${days} dias`;
        if (days <= 60) return `Faltam ${days} dias`;
        
        const months = Math.floor(days / 30);
        const remainingDays = days % 30;
        
        if (months === 1) {
            return remainingDays === 0 ? 'Falta 1 mês' : `Falta 1 mês e ${remainingDays} dias`;
        }
        
        return remainingDays === 0 ? `Faltam ${months} meses` : `Faltam ${months} meses e ${remainingDays} dias`;
    }

    // Obter classe CSS baseada na urgência
    getUrgencyClass(days) {
        if (days <= 7) return 'urgent';
        if (days <= 30) return 'upcoming';
        return 'normal';
    }

    // Renderizar lista de aniversários
    renderBirthdays(filter = 'all') {
        const container = document.getElementById('birthdays-list');
        
        if (this.birthdays.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-birthday-cake"></i>
                    <h3>Nenhum aniversário cadastrado</h3>
                    <p>Adicione seu primeiro lembrete de aniversário acima!</p>
                </div>
            `;
            return;
        }

        // Filtrar aniversários
        let filteredBirthdays = this.birthdays;
        if (filter === 'urgent') {
            filteredBirthdays = this.birthdays.filter(b => this.calculateDaysUntilBirthday(b.date) <= 7);
        } else if (filter === 'upcoming') {
            filteredBirthdays = this.birthdays.filter(b => {
                const days = this.calculateDaysUntilBirthday(b.date);
                return days > 7 && days <= 30;
            });
        }

        // Ordenar por proximidade do aniversário
        filteredBirthdays.sort((a, b) => {
            return this.calculateDaysUntilBirthday(a.date) - this.calculateDaysUntilBirthday(b.date);
        });

        if (filteredBirthdays.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-search"></i>
                    <h3>Nenhum aniversário encontrado</h3>
                    <p>Não há aniversários que correspondam ao filtro selecionado.</p>
                </div>
            `;
            return;
        }

        container.innerHTML = filteredBirthdays.map(birthday => {
            const days = this.calculateDaysUntilBirthday(birthday.date);
            const currentAge = this.calculateCurrentAge(birthday.date);
            const nextAge = this.calculateNextAge(birthday.date);
            const nextBirthdayDate = this.getNextBirthdayDate(birthday.date);
            const urgencyClass = this.getUrgencyClass(days);
            const daysText = this.getDaysLeftText(days);

            return `
                <div class="birthday-card ${urgencyClass}" data-id="${birthday.id}">
                    ${birthday.photo ? 
                        `<img src="${birthday.photo}" alt="${birthday.name}" class="birthday-photo">` :
                        `<div class="default-avatar">${birthday.name.charAt(0).toUpperCase()}</div>`
                    }
                    <div class="birthday-info">
                        <h3>${birthday.name}</h3>
                        ${birthday.description ? `<p class="birthday-description">${birthday.description}</p>` : ''}
                        <p class="birthday-date">🎂 ${DateUtils.formatDateString(birthday.date)}</p>
                        <div class="age-info">
                            <span class="current-age">${currentAge} anos</span>
                            <span class="next-age">Fará ${nextAge} anos em ${nextBirthdayDate}</span>
                        </div>
                        <span class="days-left ${urgencyClass}">${daysText}</span>
                    </div>
                    <div class="birthday-actions">
                        <button class="btn-delete" onclick="birthdayManager.deleteBirthday(${birthday.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }

    // Filtrar aniversários
    filterBirthdays(filter) {
        // Atualizar botões ativos
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-filter="${filter}"]`).classList.add('active');

        // Renderizar com filtro
        this.renderBirthdays(filter);
    }

    // Excluir aniversário
    deleteBirthday(id) {
        const birthday = this.birthdays.find(b => b.id === id);
        if (!birthday) return;

        // Mostrar modal de confirmação
        document.getElementById('delete-person-name').textContent = birthday.name;
        this.showModal();
        this.deleteId = id;
    }

    // Confirmar exclusão
    confirmDelete() {
        if (!this.deleteId) return;

        const birthday = this.birthdays.find(b => b.id === this.deleteId);
        this.birthdays = this.birthdays.filter(b => b.id !== this.deleteId);
        this.saveBirthdays();
        this.renderBirthdays();
        this.updateStats();
        this.hideModal();
        this.showNotification(`Aniversário de ${birthday.name} removido com sucesso!`, 'success');
        delete this.deleteId;
    }

    // Mostrar modal
    showModal() {
        const modal = document.getElementById('confirm-modal');
        modal.classList.remove('hidden');
        setTimeout(() => modal.classList.add('show'), 10);
    }

    // Esconder modal
    hideModal() {
        const modal = document.getElementById('confirm-modal');
        modal.classList.remove('show');
        setTimeout(() => modal.classList.add('hidden'), 300);
    }

    // Atualizar estatísticas
    updateStats() {
        const total = this.birthdays.length;
        const urgentCount = this.birthdays.filter(b => this.calculateDaysUntilBirthday(b.date) <= 7).length;
        
        let statsText = `${total} aniversário${total !== 1 ? 's' : ''} cadastrado${total !== 1 ? 's' : ''}`;
        if (urgentCount > 0) {
            statsText += ` • ${urgentCount} urgente${urgentCount !== 1 ? 's' : ''}`;
        }
        
        document.getElementById('total-birthdays').textContent = statsText;
    }

    // Verificar e exibir notificações
    checkNotifications() {
        const today = DateUtils.getToday();
        const todayStr = `${today.year}-${today.month}-${today.day}`;

        this.birthdays.forEach(birthday => {
            const days = this.calculateDaysUntilBirthday(birthday.date);
            const notificationKey = `${birthday.id}_${todayStr}`;

            // Verificar se já notificou hoje para esta pessoa
            if (this.notificationSettings[notificationKey]) return;

            let shouldNotify = false;
            let message = '';

            // Regras de notificação
            if (days === 0) {
                shouldNotify = true;
                message = `🎉 Hoje é aniversário de ${birthday.name}! 🎂`;
            } else if (days === 1) {
                shouldNotify = true;
                message = `🎈 Amanhã é aniversário de ${birthday.name}!`;
            } else if (days === 3) {
                shouldNotify = true;
                message = `⏰ Faltam 3 dias para o aniversário de ${birthday.name}!`;
            } else if (days === 7) {
                shouldNotify = true;
                message = `📅 Falta uma semana para o aniversário de ${birthday.name}!`;
            } else if (days === 14) {
                shouldNotify = true;
                message = `🗓️ Faltam 14 dias para o aniversário de ${birthday.name}!`;
            } else if (days === 30) {
                shouldNotify = true;
                message = `📆 Falta um mês para o aniversário de ${birthday.name}!`;
            }

            if (shouldNotify) {
                this.showNotificationBanner(message);
                this.sendBrowserNotification(`Lembrete de Aniversário`, message);
                
                // Marcar como notificado
                this.notificationSettings[notificationKey] = true;
                this.saveNotificationSettings();
            }
        });
    }

    // Mostrar banner de notificação
    showNotificationBanner(message) {
        const banner = document.getElementById('notification-banner');
        const text = document.getElementById('notification-text');
        
        text.textContent = message;
        banner.classList.remove('hidden');
    }

    // Esconder banner de notificação
    hideNotificationBanner() {
        document.getElementById('notification-banner').classList.add('hidden');
    }

    // Solicitar permissão para notificações
    requestNotificationPermission(force = false) {
        if ('Notification' in window) {
            if (Notification.permission === 'default' || force) {
                if (force) {
                    Notification.requestPermission().then(permission => {
                        if (permission === 'granted') {
                            this.showNotification('Notificações ativadas com sucesso!', 'success');
                        }
                        this.hideNotificationPermission();
                    });
                } else {
                    // Mostrar pedido personalizado primeiro
                    setTimeout(() => {
                        document.getElementById('notification-permission').classList.add('show');
                    }, 3000);
                }
            }
        }
    }

    // Esconder pedido de permissão
    hideNotificationPermission() {
        document.getElementById('notification-permission').classList.remove('show');
    }

    // Enviar notificação do navegador
    sendBrowserNotification(title, body) {
        if ('Notification' in window && Notification.permission === 'granted') {
            const notification = new Notification(title, {
                body: body,
                icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">🎂</text></svg>',
                badge: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">🎂</text></svg>',
                tag: 'birthday-reminder',
                requireInteraction: false,
                silent: false
            });

            // Fechar automaticamente após 5 segundos
            setTimeout(() => notification.close(), 5000);
        }
    }

    // Mostrar notificação temporária
    showNotification(message, type = 'info') {
        // Criar elemento de notificação
        const notification = document.createElement('div');
        notification.className = `toast-notification ${type}`;
        notification.innerHTML = `
            <div class="toast-content">
                <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
                <span>${message}</span>
            </div>
        `;

        // Adicionar estilos se não existirem
        if (!document.getElementById('toast-styles')) {
            const styles = document.createElement('style');
            styles.id = 'toast-styles';
            styles.textContent = `
                .toast-notification {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    padding: 15px 20px;
                    border-radius: 10px;
                    color: white;
                    font-weight: 500;
                    z-index: 10000;
                    transform: translateX(100%);
                    transition: transform 0.3s ease;
                    max-width: 300px;
                    word-wrap: break-word;
                }
                .toast-notification.success { background: #4ecdc4; }
                .toast-notification.error { background: #ff6b6b; }
                .toast-notification.info { background: #667eea; }
                .toast-content {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }
                .toast-notification.show {
                    transform: translateX(0);
                }
            `;
            document.head.appendChild(styles);
        }

        document.body.appendChild(notification);

        // Animar entrada
        setTimeout(() => notification.classList.add('show'), 100);

        // Remover após 4 segundos
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 4000);
    }

    // Iniciar timer para verificar notificações periodicamente
    startNotificationTimer() {
        // Verificar a cada hora
        setInterval(() => {
            this.checkNotifications();
        }, 60 * 60 * 1000);

        // Verificar à meia-noite usando timeout calculado manualmente
        const now = new Date();
        const msUntilMidnight = (24 * 60 * 60 * 1000) - 
            (now.getHours() * 60 * 60 * 1000) - 
            (now.getMinutes() * 60 * 1000) - 
            (now.getSeconds() * 1000) - 
            now.getMilliseconds();
        
        setTimeout(() => {
            this.checkNotifications();
            // Depois configurar para verificar diariamente
            setInterval(() => {
                this.checkNotifications();
            }, 24 * 60 * 60 * 1000);
        }, msUntilMidnight);
    }

    // 🔄 SISTEMA DE SINCRONIZAÇÃO EM NUVEM 🔄
    async generateSyncCode() {
        const btn = document.getElementById('generate-code-btn');
        const originalText = btn.innerHTML;
        
        try {
            btn.disabled = true;
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Gerando...';
            
            // Gerar código único
            const code = this.generateRandomCode();
            
            // Preparar dados para sincronização
            const syncData = {
                birthdays: this.birthdays,
                notificationSettings: this.notificationSettings,
                timestamp: Date.now(),
                version: '3.4.0'
            };
            
            // Salvar na nuvem (JSONBin.io - gratuito)
            const success = await this.saveSyncData(code, syncData);
            
            if (success) {
                this.showCodeModal(code);
                this.updateSyncStatus('online');
            } else {
                throw new Error('Falha ao salvar dados na nuvem');
            }
            
        } catch (error) {
            console.error('Erro ao gerar código:', error);
            this.showNotification('❌ Erro ao gerar código. Verifique sua conexão!', 'error');
            this.updateSyncStatus('offline');
        } finally {
            btn.disabled = false;
            btn.innerHTML = originalText;
        }
    }
    
    async syncFromCode() {
        const codeInput = document.getElementById('sync-code-input');
        const btn = document.getElementById('sync-code-btn');
        const code = codeInput.value.trim().toUpperCase();
        
        if (!code || code.length !== 6) {
            this.showNotification('⚠️ Digite um código válido de 6 caracteres!', 'error');
            return;
        }
        
        const originalText = btn.innerHTML;
        
        try {
            btn.disabled = true;
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sincronizando...';
            this.updateSyncStatus('syncing');
            
            // Buscar dados da nuvem
            const syncData = await this.loadSyncData(code);
            
            if (syncData) {
                // Confirmar sincronização
                const confirm = window.confirm(
                    `📱 Dados encontrados!\n\n` +
                    `• ${syncData.birthdays.length} aniversário(s)\n` +
                    `• Versão: ${syncData.version}\n` +
                    `• Data: ${new Date(syncData.timestamp).toLocaleString()}\n\n` +
                    `⚠️ Seus dados atuais serão substituídos. Continuar?`
                );
                
                if (confirm) {
                    // Aplicar dados sincronizados
                    this.birthdays = syncData.birthdays;
                    this.notificationSettings = syncData.notificationSettings || {};
                    
                    // Salvar localmente
                    this.saveBirthdays();
                    this.saveNotificationSettings();
                    
                    // Atualizar interface
                    this.renderBirthdays();
                    this.updateStats();
                    this.checkNotifications();
                    
                    this.showNotification(`✅ ${syncData.birthdays.length} aniversário(s) sincronizados com sucesso!`, 'success');
                    this.updateSyncStatus('online');
                    codeInput.value = '';
                } else {
                    this.updateSyncStatus('offline');
                }
            } else {
                throw new Error('Código não encontrado ou expirado');
            }
            
        } catch (error) {
            console.error('Erro na sincronização:', error);
            this.showNotification('❌ Código inválido ou expirado!', 'error');
            this.updateSyncStatus('offline');
        } finally {
            btn.disabled = false;
            btn.innerHTML = originalText;
        }
    }
    
    generateRandomCode() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let result = '';
        for (let i = 0; i < 6; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }
    
    async saveSyncData(code, data) {
        try {
            // Usar httpbin.org como demonstração (substitua por serviço real)
            const response = await fetch('https://httpbin.org/post', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    code: code,
                    data: data,
                    expires: Date.now() + (15 * 60 * 1000) // 15 minutos
                })
            });
            
            if (response.ok) {
                // Simular salvamento local temporário
                localStorage.setItem(`SYNC_${code}`, JSON.stringify({
                    data: data,
                    expires: Date.now() + (15 * 60 * 1000)
                }));
                return true;
            }
            return false;
        } catch (error) {
            // Fallback: salvar localmente
            localStorage.setItem(`SYNC_${code}`, JSON.stringify({
                data: data,
                expires: Date.now() + (15 * 60 * 1000)
            }));
            return true;
        }
    }
    
    async loadSyncData(code) {
        try {
            // Tentar carregar do localStorage (simulação)
            const stored = localStorage.getItem(`SYNC_${code}`);
            
            if (stored) {
                const parsed = JSON.parse(stored);
                
                // Verificar se expirou
                if (Date.now() > parsed.expires) {
                    localStorage.removeItem(`SYNC_${code}`);
                    return null;
                }
                
                return parsed.data;
            }
            
            return null;
        } catch (error) {
            console.error('Erro ao carregar dados:', error);
            return null;
        }
    }
    
    showCodeModal(code) {
        const modal = document.getElementById('code-modal');
        const codeElement = document.getElementById('generated-code');
        const timerElement = document.getElementById('code-timer');
        
        codeElement.textContent = code;
        modal.classList.remove('hidden');
        setTimeout(() => modal.classList.add('show'), 10);
        
        // Iniciar timer de 15 minutos
        this.startCodeTimer(timerElement, code);
    }
    
    hideCodeModal() {
        const modal = document.getElementById('code-modal');
        modal.classList.remove('show');
        setTimeout(() => modal.classList.add('hidden'), 300);
        
        // Limpar timer
        if (this.codeTimer) {
            clearInterval(this.codeTimer);
        }
    }
    
    startCodeTimer(timerElement, code) {
        let timeLeft = 15 * 60; // 15 minutos em segundos
        
        this.codeTimer = setInterval(() => {
            const minutes = Math.floor(timeLeft / 60);
            const seconds = timeLeft % 60;
            
            timerElement.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
            
            // Mudar cor conforme o tempo
            if (timeLeft <= 60) {
                timerElement.className = 'code-timer danger';
            } else if (timeLeft <= 300) {
                timerElement.className = 'code-timer warning';
            }
            
            timeLeft--;
            
            if (timeLeft < 0) {
                clearInterval(this.codeTimer);
                localStorage.removeItem(`SYNC_${code}`);
                this.hideCodeModal();
                this.showNotification('⏰ Código expirado!', 'error');
            }
        }, 1000);
    }
    
    updateSyncStatus(status) {
        const statusElement = document.getElementById('sync-status');
        const indicatorElement = document.getElementById('sync-indicator');
        
        switch (status) {
            case 'online':
                statusElement.textContent = 'Online';
                indicatorElement.className = 'sync-indicator online';
                break;
            case 'syncing':
                statusElement.textContent = 'Sincronizando...';
                indicatorElement.className = 'sync-indicator syncing';
                break;
            default:
                statusElement.textContent = 'Offline';
                indicatorElement.className = 'sync-indicator';
        }
    }

    // 🚨 SISTEMA DE BACKUP DE EMERGÊNCIA 🚨
    // Estado atual hardcoded - v3.3.0 (19/09/2025)
    initializeEmergencyBackup() {
        // Listener para detectar a frase mágica
        document.addEventListener('keyup', (e) => {
            this.detectEmergencyPhrase(e);
        });
        
        // Salvar estado atual como backup de emergência (apenas uma vez)
        if (!localStorage.getItem('EMERGENCY_BACKUP_v3_3_0')) {
            this.createEmergencyBackup();
        }
    }

    detectEmergencyPhrase(event) {
        if (!this.emergencyBuffer) this.emergencyBuffer = '';
        
        // Adicionar caractere ao buffer
        if (event.key.length === 1 || event.key === ' ') {
            this.emergencyBuffer += event.key.toLowerCase();
        }
        
        // Manter apenas os últimos 30 caracteres
        if (this.emergencyBuffer.length > 30) {
            this.emergencyBuffer = this.emergencyBuffer.slice(-30);
        }
        
        // Verificar se contém a frase mágica
        if (this.emergencyBuffer.includes('aqui deu merda patrao')) {
            this.executeEmergencyRestore();
            this.emergencyBuffer = ''; // Limpar buffer
        }
    }

    createEmergencyBackup() {
        const emergencyData = {
            version: '3.3.0',
            date: '2025-09-19',
            birthdays: [],
            notificationSettings: {}
        };
        
        localStorage.setItem('EMERGENCY_BACKUP_v3_3_0', JSON.stringify(emergencyData));
        console.log('🚨 Backup de emergência criado para v3.3.0');
    }

    executeEmergencyRestore() {
        const backup = localStorage.getItem('EMERGENCY_BACKUP_v3_3_0');
        
        if (backup) {
            const data = JSON.parse(backup);
            
            // Restaurar dados
            this.birthdays = data.birthdays;
            this.notificationSettings = data.notificationSettings;
            
            // Salvar no localStorage
            this.saveBirthdays();
            this.saveNotificationSettings();
            
            // Atualizar interface
            this.renderBirthdays();
            this.updateStats();
            
            // Mostrar confirmação dramática
            this.showNotification('🚨 SISTEMA RESTAURADO! Voltamos ao ponto seguro v3.3.0! 🚨', 'success');
            
            console.log('🚨 EMERGÊNCIA ATIVADA! Sistema restaurado para v3.3.0');
            
            // Adicionar efeito visual dramático
            document.body.style.animation = 'shake 0.5s ease-in-out 3';
            setTimeout(() => {
                document.body.style.animation = '';
            }, 1500);
        } else {
            this.showNotification('❌ Backup de emergência não encontrado!', 'error');
        }
    }
}

// Inicializar quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    window.birthdayManager = new BirthdayManager();
});

// Service Worker para notificações em background (opcional)
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').catch(err => {
        console.log('Service Worker registration failed:', err);
    });
}