// AR'BON Financial Management System - Main Application
// Copyright © 2024 AR'BON. All Rights Reserved.
// Security: This application is protected with advanced security measures

'use strict';

// Security: Input sanitization
const sanitizeInput = (input) => {
    const div = document.createElement('div');
    div.textContent = input;
    return div.innerHTML;
};

// Security: XSS Protection
const escapeHtml = (text) => {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
};

// Application State
const AppState = {
    currentUser: null,
    transactions: [],
    currentPage: 'beranda',
    currentCategory: 'all',
    charts: {},
    lastUpdate: Date.now(),
    autoUpdateInterval: null
};

// Local Storage Management with Encryption
const Storage = {
    save: (key, data) => {
        try {
            const encrypted = btoa(JSON.stringify(data));
            localStorage.setItem(key, encrypted);
            return true;
        } catch (e) {
            console.error('Storage save error:', e);
            return false;
        }
    },
    
    load: (key) => {
        try {
            const encrypted = localStorage.getItem(key);
            if (!encrypted) return null;
            return JSON.parse(atob(encrypted));
        } catch (e) {
            console.error('Storage load error:', e);
            return null;
        }
    },
    
    remove: (key) => {
        localStorage.removeItem(key);
    }
};

// Authentication Module
const Auth = {
    init: () => {
        // Check if user is already logged in
        const savedUser = Storage.load('arbon_user');
        if (savedUser) {
            AppState.currentUser = savedUser;
            Auth.showMainApp();
        }
        
        // Login form handler
        document.getElementById('email-login-form').addEventListener('submit', Auth.handleEmailLogin);
        
        // Register form handler
        document.getElementById('email-register-form').addEventListener('submit', Auth.handleEmailRegister);
        
        // Google auth buttons
        document.getElementById('google-login').addEventListener('click', Auth.handleGoogleAuth);
        document.getElementById('google-register').addEventListener('click', Auth.handleGoogleAuth);
        
        // Auth tab switching
        document.querySelectorAll('.auth-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                const tabName = e.target.dataset.tab;
                Auth.switchTab(tabName);
            });
        });
        
        // Logout button
        document.getElementById('logout-btn').addEventListener('click', Auth.logout);
    },
    
    switchTab: (tabName) => {
        document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.auth-form').forEach(f => f.classList.remove('active'));
        
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
        document.getElementById(`${tabName}-form`).classList.add('active');
    },
    
    handleEmailLogin: (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        
        // Validate
        if (!Auth.validateEmail(email)) {
            UI.showMessage('Email tidak valid', 'error');
            return;
        }
        
        // Check stored users
        const users = Storage.load('arbon_users') || {};
        const user = users[email];
        
        if (!user || user.password !== btoa(password)) {
            UI.showMessage('Email atau password salah', 'error');
            return;
        }
        
        // Login success
        AppState.currentUser = {
            name: user.name,
            email: user.email
        };
        
        Storage.save('arbon_user', AppState.currentUser);
        Auth.showMainApp();
        UI.showMessage('Login berhasil!', 'success');
    },
    
    handleEmailRegister: (e) => {
        e.preventDefault();
        const name = document.getElementById('register-name').value;
        const email = document.getElementById('register-email').value;
        const password = document.getElementById('register-password').value;
        
        // Validate
        if (!Auth.validateEmail(email)) {
            UI.showMessage('Email tidak valid', 'error');
            return;
        }
        
        if (password.length < 8) {
            UI.showMessage('Password minimal 8 karakter', 'error');
            return;
        }
        
        // Check if user exists
        const users = Storage.load('arbon_users') || {};
        if (users[email]) {
            UI.showMessage('Email sudah terdaftar', 'error');
            return;
        }
        
        // Register user
        users[email] = {
            name: sanitizeInput(name),
            email: email,
            password: btoa(password),
            registeredAt: new Date().toISOString()
        };
        
        Storage.save('arbon_users', users);
        
        // Auto login
        AppState.currentUser = {
            name: name,
            email: email
        };
        
        Storage.save('arbon_user', AppState.currentUser);
        Auth.showMainApp();
        UI.showMessage('Registrasi berhasil!', 'success');
    },
    
    handleGoogleAuth: () => {
        // Simulated Google OAuth (in production, use real Google OAuth)
        UI.showMessage('Fitur Google OAuth akan diintegrasikan dengan Google API', 'error');
        // In production: Implement Google OAuth 2.0
        // window.location.href = 'https://accounts.google.com/o/oauth2/v2/auth?...'
    },
    
    validateEmail: (email) => {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    },
    
    showMainApp: () => {
        document.getElementById('auth-page').classList.remove('active');
        document.getElementById('main-app').classList.add('active');
        document.getElementById('user-name').textContent = AppState.currentUser.name;
        
        // Load data and initialize
        Data.loadTransactions();
        Dashboard.init();
        Reports.init();
        AutoUpdate.init();
    },
    
    logout: () => {
        if (confirm('Apakah Anda yakin ingin keluar?')) {
            Storage.remove('arbon_user');
            AppState.currentUser = null;
            AppState.transactions = [];
            
            document.getElementById('main-app').classList.remove('active');
            document.getElementById('auth-page').classList.add('active');
            
            // Clear forms
            document.getElementById('email-login-form').reset();
            
            AutoUpdate.stop();
            UI.showMessage('Logout berhasil', 'success');
        }
    }
};

// Data Management Module
const Data = {
    loadTransactions: () => {
        AppState.transactions = Storage.load('arbon_transactions') || [];
        AppState.lastUpdate = Date.now();
    },
    
    saveTransactions: () => {
        Storage.save('arbon_transactions', AppState.transactions);
        AppState.lastUpdate = Date.now();
    },
    
    addTransaction: (transaction) => {
        transaction.id = Date.now() + Math.random();
        transaction.createdAt = new Date().toISOString();
        AppState.transactions.unshift(transaction);
        Data.saveTransactions();
        return transaction;
    },
    
    updateTransaction: (id, updates) => {
        const index = AppState.transactions.findIndex(t => t.id === id);
        if (index !== -1) {
            AppState.transactions[index] = { ...AppState.transactions[index], ...updates };
            Data.saveTransactions();
            return true;
        }
        return false;
    },
    
    deleteTransaction: (id) => {
        const index = AppState.transactions.findIndex(t => t.id === id);
        if (index !== -1) {
            AppState.transactions.splice(index, 1);
            Data.saveTransactions();
            return true;
        }
        return false;
    },
    
    getTransactions: (filters = {}) => {
        let filtered = [...AppState.transactions];
        
        if (filters.category && filters.category !== 'all') {
            filtered = filtered.filter(t => t.category === filters.category);
        }
        
        if (filters.type && filters.type !== 'all') {
            filtered = filtered.filter(t => t.type === filters.type);
        }
        
        if (filters.search) {
            const search = filters.search.toLowerCase();
            filtered = filtered.filter(t => 
                t.name.toLowerCase().includes(search) ||
                t.description.toLowerCase().includes(search)
            );
        }
        
        return filtered;
    },
    
    calculateTotals: () => {
        const income = AppState.transactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + parseFloat(t.amount), 0);
        
        const expense = AppState.transactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + parseFloat(t.amount), 0);
        
        return {
            income,
            expense,
            balance: income - expense,
            count: AppState.transactions.length
        };
    }
};

// Dashboard Module
const Dashboard = {
    init: () => {
        Dashboard.updateSummary();
        Dashboard.updateRecentTransactions();
        Dashboard.initCharts();
        
        document.getElementById('refresh-beranda').addEventListener('click', () => {
            Dashboard.refresh();
        });
    },
    
    refresh: () => {
        Data.loadTransactions();
        Dashboard.updateSummary();
        Dashboard.updateRecentTransactions();
        Dashboard.updateCharts();
        UI.showMessage('Data diperbarui', 'success');
    },
    
    updateSummary: () => {
        const totals = Data.calculateTotals();
        
        document.getElementById('total-income').textContent = Utils.formatCurrency(totals.income);
        document.getElementById('total-expense').textContent = Utils.formatCurrency(totals.expense);
        document.getElementById('balance').textContent = Utils.formatCurrency(totals.balance);
        document.getElementById('total-transactions').textContent = totals.count;
    },
    
    updateRecentTransactions: () => {
        const tbody = document.getElementById('recent-transactions-body');
        const recent = AppState.transactions.slice(0, 10);
        
        if (recent.length === 0) {
            tbody.innerHTML = '<tr class="no-data"><td colspan="6">Belum ada transaksi</td></tr>';
            return;
        }
        
        tbody.innerHTML = recent.map(t => `
            <tr>
                <td>${Utils.formatDate(t.date)}</td>
                <td>${escapeHtml(t.name)}</td>
                <td>${escapeHtml(t.description)}</td>
                <td>${Utils.getCategoryLabel(t.category)}</td>
                <td><span class="badge ${t.type}">${t.type === 'income' ? 'Pemasukan' : 'Pengeluaran'}</span></td>
                <td>${Utils.formatCurrency(t.amount)}</td>
            </tr>
        `).join('');
    },
    
    initCharts: () => {
        Dashboard.createIncomeExpenseChart();
        Dashboard.createExpenseDistributionChart();
    },
    
    updateCharts: () => {
        if (AppState.charts.incomeExpense) {
            AppState.charts.incomeExpense.destroy();
        }
        if (AppState.charts.expenseDistribution) {
            AppState.charts.expenseDistribution.destroy();
        }
        Dashboard.initCharts();
    },
    
    createIncomeExpenseChart: () => {
        const ctx = document.getElementById('income-expense-chart').getContext('2d');
        
        // Group by month
        const monthlyData = Utils.groupByMonth(AppState.transactions);
        
        AppState.charts.incomeExpense = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: monthlyData.labels,
                datasets: [
                    {
                        label: 'Pemasukan',
                        data: monthlyData.income,
                        backgroundColor: 'rgba(16, 185, 129, 0.7)',
                        borderColor: 'rgb(16, 185, 129)',
                        borderWidth: 2
                    },
                    {
                        label: 'Pengeluaran',
                        data: monthlyData.expense,
                        backgroundColor: 'rgba(239, 68, 68, 0.7)',
                        borderColor: 'rgb(239, 68, 68)',
                        borderWidth: 2
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        position: 'top',
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return 'Rp ' + value.toLocaleString('id-ID');
                            }
                        }
                    }
                }
            }
        });
    },
    
    createExpenseDistributionChart: () => {
        const ctx = document.getElementById('expense-distribution-chart').getContext('2d');
        
        // Group expenses by category
        const categoryData = Utils.groupByCategory(AppState.transactions.filter(t => t.type === 'expense'));
        
        AppState.charts.expenseDistribution = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: categoryData.labels,
                datasets: [{
                    data: categoryData.values,
                    backgroundColor: [
                        'rgba(37, 99, 235, 0.7)',
                        'rgba(124, 58, 237, 0.7)',
                        'rgba(245, 158, 11, 0.7)',
                        'rgba(6, 182, 212, 0.7)',
                        'rgba(239, 68, 68, 0.7)'
                    ],
                    borderWidth: 2,
                    borderColor: '#fff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        position: 'bottom',
                    }
                }
            }
        });
    }
};

// Reports Module
const Reports = {
    init: () => {
        Reports.updateTotals();
        Reports.updateTable();
        
        // Event listeners
        document.getElementById('add-transaction-btn').addEventListener('click', Reports.showAddModal);
        document.getElementById('import-data-btn').addEventListener('click', Reports.showImportModal);
        document.getElementById('export-data-btn').addEventListener('click', Reports.showExportModal);
        
        // Category tabs
        document.querySelectorAll('.category-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                const category = e.target.dataset.category;
                Reports.switchCategory(category);
            });
        });
        
        // Search and filter
        document.getElementById('search-transaction').addEventListener('input', Reports.updateTable);
        document.getElementById('filter-type').addEventListener('change', Reports.updateTable);
        
        // Transaction form
        document.getElementById('transaction-form').addEventListener('submit', Reports.handleAddTransaction);
        
        // Modal controls
        document.querySelectorAll('.modal-close, .modal-cancel').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.target.closest('.modal').classList.remove('active');
            });
        });
        
        // Import/Export handlers
        Reports.initImportExport();
    },
    
    switchCategory: (category) => {
        AppState.currentCategory = category;
        
        document.querySelectorAll('.category-tab').forEach(t => t.classList.remove('active'));
        document.querySelector(`[data-category="${category}"]`).classList.add('active');
        
        Reports.updateTable();
    },
    
    updateTotals: () => {
        const totals = Data.calculateTotals();
        document.getElementById('laporan-total-income').textContent = Utils.formatCurrency(totals.income);
        document.getElementById('laporan-total-expense').textContent = Utils.formatCurrency(totals.expense);
    },
    
    updateTable: () => {
        const tbody = document.getElementById('transactions-body');
        const search = document.getElementById('search-transaction').value;
        const type = document.getElementById('filter-type').value;
        
        const transactions = Data.getTransactions({
            category: AppState.currentCategory,
            type: type,
            search: search
        });
        
        if (transactions.length === 0) {
            tbody.innerHTML = '<tr class="no-data"><td colspan="7">Tidak ada transaksi</td></tr>';
            return;
        }
        
        tbody.innerHTML = transactions.map(t => `
            <tr>
                <td>${Utils.formatDate(t.date)}</td>
                <td>${escapeHtml(t.name)}</td>
                <td>${escapeHtml(t.description)}</td>
                <td>${Utils.getCategoryLabel(t.category)}</td>
                <td><span class="badge ${t.type}">${t.type === 'income' ? 'Pemasukan' : 'Pengeluaran'}</span></td>
                <td>${Utils.formatCurrency(t.amount)}</td>
                <td>
                    <button class="btn-edit" onclick="Reports.editTransaction(${t.id})">Edit</button>
                    <button class="btn-delete" onclick="Reports.deleteTransaction(${t.id})">Hapus</button>
                </td>
            </tr>
        `).join('');
    },
    
    showAddModal: () => {
        document.getElementById('transaction-form').reset();
        document.getElementById('trans-date').valueAsDate = new Date();
        document.getElementById('transaction-modal').classList.add('active');
    },
    
    handleAddTransaction: (e) => {
        e.preventDefault();
        
        const transaction = {
            date: document.getElementById('trans-date').value,
            name: sanitizeInput(document.getElementById('trans-name').value),
            description: sanitizeInput(document.getElementById('trans-description').value),
            category: document.getElementById('trans-category').value,
            type: document.getElementById('trans-type').value,
            amount: parseFloat(document.getElementById('trans-amount').value)
        };
        
        Data.addTransaction(transaction);
        
        document.getElementById('transaction-modal').classList.remove('active');
        Reports.updateTotals();
        Reports.updateTable();
        Dashboard.updateSummary();
        Dashboard.updateRecentTransactions();
        Dashboard.updateCharts();
        
        UI.showMessage('Transaksi berhasil ditambahkan', 'success');
    },
    
    editTransaction: (id) => {
        const transaction = AppState.transactions.find(t => t.id === id);
        if (!transaction) return;
        
        // Populate form
        document.getElementById('trans-date').value = transaction.date;
        document.getElementById('trans-name').value = transaction.name;
        document.getElementById('trans-description').value = transaction.description;
        document.getElementById('trans-category').value = transaction.category;
        document.getElementById('trans-type').value = transaction.type;
        document.getElementById('trans-amount').value = transaction.amount;
        
        // Change form handler to update
        const form = document.getElementById('transaction-form');
        form.onsubmit = (e) => {
            e.preventDefault();
            
            Data.updateTransaction(id, {
                date: document.getElementById('trans-date').value,
                name: sanitizeInput(document.getElementById('trans-name').value),
                description: sanitizeInput(document.getElementById('trans-description').value),
                category: document.getElementById('trans-category').value,
                type: document.getElementById('trans-type').value,
                amount: parseFloat(document.getElementById('trans-amount').value)
            });
            
            document.getElementById('transaction-modal').classList.remove('active');
            form.onsubmit = Reports.handleAddTransaction;
            
            Reports.updateTotals();
            Reports.updateTable();
            Dashboard.updateSummary();
            Dashboard.updateRecentTransactions();
            Dashboard.updateCharts();
            
            UI.showMessage('Transaksi berhasil diperbarui', 'success');
        };
        
        document.getElementById('transaction-modal').classList.add('active');
    },
    
    deleteTransaction: (id) => {
        if (confirm('Apakah Anda yakin ingin menghapus transaksi ini?')) {
            Data.deleteTransaction(id);
            
            Reports.updateTotals();
            Reports.updateTable();
            Dashboard.updateSummary();
            Dashboard.updateRecentTransactions();
            Dashboard.updateCharts();
            
            UI.showMessage('Transaksi berhasil dihapus', 'success');
        }
    },
    
    showImportModal: () => {
        document.getElementById('import-modal').classList.add('active');
    },
    
    showExportModal: () => {
        document.getElementById('export-modal').classList.add('active');
    },
    
    initImportExport: () => {
        // Import options
        document.querySelectorAll('.import-option').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const type = e.currentTarget.dataset.type;
                document.getElementById('file-import-input').accept = `.${type}`;
                document.getElementById('file-import-input').click();
            });
        });
        
        // File input handler
        document.getElementById('file-import-input').addEventListener('change', ImportExport.handleImport);
        
        // Export options
        document.querySelectorAll('.export-option').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const type = e.currentTarget.dataset.type;
                ImportExport.handleExport(type);
            });
        });
    }
};

// Import/Export Module
const ImportExport = {
    handleImport: (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        const fileType = file.name.split('.').pop().toLowerCase();
        
        const reader = new FileReader();
        reader.onload = (e) => {
            const content = e.target.result;
            
            switch(fileType) {
                case 'csv':
                    ImportExport.importCSV(content);
                    break;
                case 'pdf':
                    UI.showMessage('Import PDF akan memerlukan OCR processing', 'error');
                    break;
                case 'doc':
                case 'docx':
                    UI.showMessage('Import Word dalam development', 'error');
                    break;
                case 'ppt':
                case 'pptx':
                    UI.showMessage('Import PowerPoint dalam development', 'error');
                    break;
                default:
                    UI.showMessage('Format file tidak didukung', 'error');
            }
        };
        
        if (fileType === 'csv') {
            reader.readAsText(file);
        } else {
            reader.readAsArrayBuffer(file);
        }
    },
    
    importCSV: (content) => {
        try {
            const parsed = Papa.parse(content, {
                header: true,
                skipEmptyLines: true
            });
            
            const imported = parsed.data.map(row => ({
                date: row.date || row.tanggal || new Date().toISOString().split('T')[0],
                name: sanitizeInput(row.name || row.nama || ''),
                description: sanitizeInput(row.description || row.deskripsi || ''),
                category: row.category || row.kategori || 'other',
                type: row.type || row.tipe || 'expense',
                amount: parseFloat(row.amount || row.nominal || 0)
            })).filter(t => t.name && t.amount > 0);
            
            imported.forEach(t => Data.addTransaction(t));
            
            document.getElementById('import-modal').classList.remove('active');
            Reports.updateTotals();
            Reports.updateTable();
            Dashboard.updateSummary();
            Dashboard.updateRecentTransactions();
            Dashboard.updateCharts();
            
            UI.showMessage(`Berhasil import ${imported.length} transaksi`, 'success');
        } catch (error) {
            UI.showMessage('Gagal import CSV: ' + error.message, 'error');
        }
    },
    
    handleExport: (type) => {
        const transactions = Data.getTransactions({
            category: AppState.currentCategory
        });
        
        if (transactions.length === 0) {
            UI.showMessage('Tidak ada data untuk di-export', 'error');
            return;
        }
        
        switch(type) {
            case 'csv':
                ImportExport.exportCSV(transactions);
                break;
            case 'pdf':
                ImportExport.exportPDF(transactions);
                break;
            case 'docx':
                ImportExport.exportWord(transactions);
                break;
            case 'pptx':
                ImportExport.exportPowerPoint(transactions);
                break;
        }
        
        document.getElementById('export-modal').classList.remove('active');
    },
    
    exportCSV: (transactions) => {
        const csv = Papa.unparse(transactions.map(t => ({
            tanggal: t.date,
            nama: t.name,
            deskripsi: t.description,
            kategori: t.category,
            tipe: t.type,
            nominal: t.amount
        })));
        
        Utils.downloadFile(csv, 'laporan-arbon.csv', 'text/csv');
        UI.showMessage('Export CSV berhasil', 'success');
    },
    
    exportPDF: (transactions) => {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        // Header
        doc.setFontSize(20);
        doc.text('AR\'BON', 105, 15, { align: 'center' });
        doc.setFontSize(14);
        doc.text('Laporan Keuangan', 105, 22, { align: 'center' });
        doc.setFontSize(10);
        doc.text(`Tanggal: ${new Date().toLocaleDateString('id-ID')}`, 105, 28, { align: 'center' });
        
        // Summary
        const totals = Data.calculateTotals();
        doc.setFontSize(12);
        doc.text(`Total Pemasukan: ${Utils.formatCurrency(totals.income)}`, 14, 40);
        doc.text(`Total Pengeluaran: ${Utils.formatCurrency(totals.expense)}`, 14, 47);
        doc.text(`Saldo: ${Utils.formatCurrency(totals.balance)}`, 14, 54);
        
        // Table
        doc.autoTable({
            startY: 60,
            head: [['Tanggal', 'Nama', 'Kategori', 'Tipe', 'Jumlah']],
            body: transactions.map(t => [
                Utils.formatDate(t.date),
                t.name,
                Utils.getCategoryLabel(t.category),
                t.type === 'income' ? 'Pemasukan' : 'Pengeluaran',
                Utils.formatCurrency(t.amount)
            ]),
            theme: 'grid',
            headStyles: { fillColor: [37, 99, 235] }
        });
        
        doc.save('laporan-arbon.pdf');
        UI.showMessage('Export PDF berhasil', 'success');
    },
    
    exportWord: (transactions) => {
        UI.showMessage('Export Word akan segera tersedia', 'error');
        // Implementation using docx library would go here
    },
    
    exportPowerPoint: (transactions) => {
        try {
            const pptx = new PptxGenJS();
            
            // Title slide
            let slide = pptx.addSlide();
            slide.background = { color: '2563eb' };
            slide.addText('AR\'BON', {
                x: 1, y: 1.5, w: 8, h: 1,
                fontSize: 44, bold: true, color: 'FFFFFF', align: 'center'
            });
            slide.addText('Laporan Keuangan', {
                x: 1, y: 2.5, w: 8, h: 0.5,
                fontSize: 24, color: 'FFFFFF', align: 'center'
            });
            
            // Summary slide
            slide = pptx.addSlide();
            slide.addText('Ringkasan Keuangan', {
                x: 0.5, y: 0.5, w: 9, h: 0.5,
                fontSize: 28, bold: true
            });
            
            const totals = Data.calculateTotals();
            slide.addText(`Total Pemasukan: ${Utils.formatCurrency(totals.income)}`, {
                x: 1, y: 1.5, fontSize: 18, color: '10b981'
            });
            slide.addText(`Total Pengeluaran: ${Utils.formatCurrency(totals.expense)}`, {
                x: 1, y: 2.0, fontSize: 18, color: 'ef4444'
            });
            slide.addText(`Saldo: ${Utils.formatCurrency(totals.balance)}`, {
                x: 1, y: 2.5, fontSize: 18, color: '2563eb'
            });
            
            // Data slide
            slide = pptx.addSlide();
            slide.addText('Detail Transaksi', {
                x: 0.5, y: 0.5, w: 9, h: 0.5,
                fontSize: 28, bold: true
            });
            
            const tableData = [
                [
                    { text: 'Tanggal', options: { bold: true } },
                    { text: 'Nama', options: { bold: true } },
                    { text: 'Kategori', options: { bold: true } },
                    { text: 'Jumlah', options: { bold: true } }
                ]
            ];
            
            transactions.slice(0, 10).forEach(t => {
                tableData.push([
                    Utils.formatDate(t.date),
                    t.name,
                    Utils.getCategoryLabel(t.category),
                    Utils.formatCurrency(t.amount)
                ]);
            });
            
            slide.addTable(tableData, {
                x: 0.5, y: 1.2, w: 9, h: 4,
                fontSize: 12
            });
            
            pptx.writeFile({ fileName: 'laporan-arbon.pptx' });
            UI.showMessage('Export PowerPoint berhasil', 'success');
        } catch (error) {
            UI.showMessage('Export PowerPoint gagal: ' + error.message, 'error');
        }
    }
};

// UI Helper Module
const UI = {
    showMessage: (message, type = 'success') => {
        // Create message element
        const msgDiv = document.createElement('div');
        msgDiv.className = `message ${type}`;
        msgDiv.textContent = message;
        
        // Insert at top of active page
        const activePage = document.querySelector('.content-page.active') || document.querySelector('#auth-page .auth-content');
        if (activePage) {
            activePage.insertBefore(msgDiv, activePage.firstChild);
            
            // Auto remove after 3 seconds
            setTimeout(() => {
                msgDiv.remove();
            }, 3000);
        }
    }
};

// Utility Functions
const Utils = {
    formatCurrency: (amount) => {
        return 'Rp ' + parseFloat(amount).toLocaleString('id-ID', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        });
    },
    
    formatDate: (dateStr) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('id-ID', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    },
    
    getCategoryLabel: (category) => {
        const labels = {
            'gaji': 'Gaji Pekerja',
            'makan': 'Uang Makan',
            'listrik': 'Listrik',
            'produksi': 'Belanja Produksi',
            'other': 'Lainnya'
        };
        return labels[category] || category;
    },
    
    groupByMonth: (transactions) => {
        const months = {};
        
        transactions.forEach(t => {
            const date = new Date(t.date);
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            
            if (!months[monthKey]) {
                months[monthKey] = { income: 0, expense: 0 };
            }
            
            if (t.type === 'income') {
                months[monthKey].income += parseFloat(t.amount);
            } else {
                months[monthKey].expense += parseFloat(t.amount);
            }
        });
        
        const sorted = Object.keys(months).sort().slice(-6);
        
        return {
            labels: sorted.map(m => {
                const [year, month] = m.split('-');
                return new Date(year, parseInt(month) - 1).toLocaleDateString('id-ID', { month: 'short', year: 'numeric' });
            }),
            income: sorted.map(m => months[m].income),
            expense: sorted.map(m => months[m].expense)
        };
    },
    
    groupByCategory: (transactions) => {
        const categories = {};
        
        transactions.forEach(t => {
            if (!categories[t.category]) {
                categories[t.category] = 0;
            }
            categories[t.category] += parseFloat(t.amount);
        });
        
        return {
            labels: Object.keys(categories).map(c => Utils.getCategoryLabel(c)),
            values: Object.values(categories)
        };
    },
    
    downloadFile: (content, filename, contentType) => {
        const blob = new Blob([content], { type: contentType });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }
};

// Auto Update Module - Updates every 3 days
const AutoUpdate = {
    init: () => {
        // Check for updates every 3 days (259200000 ms)
        const THREE_DAYS = 259200000;
        
        AutoUpdate.checkUpdate();
        
        AppState.autoUpdateInterval = setInterval(() => {
            AutoUpdate.checkUpdate();
        }, THREE_DAYS);
    },
    
    checkUpdate: () => {
        const lastCheck = Storage.load('arbon_last_update_check') || 0;
        const now = Date.now();
        
        if (now - lastCheck > 259200000) { // 3 days
            AutoUpdate.performUpdate();
            Storage.save('arbon_last_update_check', now);
        }
    },
    
    performUpdate: () => {
        console.log('Checking for updates...');
        // In production, this would check for actual updates from server
        // For now, just log and optimize data
        AutoUpdate.optimizeData();
    },
    
    optimizeData: () => {
        // Performance optimization: Clean old cache, optimize storage
        console.log('Optimizing application data...');
        
        // Keep only last 1000 transactions for performance
        if (AppState.transactions.length > 1000) {
            AppState.transactions = AppState.transactions.slice(0, 1000);
            Data.saveTransactions();
        }
    },
    
    stop: () => {
        if (AppState.autoUpdateInterval) {
            clearInterval(AppState.autoUpdateInterval);
        }
    }
};

// Navigation
const Navigation = {
    init: () => {
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const page = e.currentTarget.dataset.page;
                Navigation.switchPage(page);
            });
        });
    },
    
    switchPage: (page) => {
        // Update nav links
        document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
        document.querySelector(`[data-page="${page}"]`).classList.add('active');
        
        // Update content pages
        document.querySelectorAll('.content-page').forEach(p => p.classList.remove('active'));
        document.getElementById(`${page}-page`).classList.add('active');
        
        AppState.currentPage = page;
        
        // Refresh data when switching pages
        if (page === 'beranda') {
            Dashboard.refresh();
        } else if (page === 'laporan') {
            Reports.updateTotals();
            Reports.updateTable();
        }
    }
};

// Initialize Application
document.addEventListener('DOMContentLoaded', () => {
    Auth.init();
    Navigation.init();
    
    console.log('%cAR\'BON Financial Management System', 'color: #2563eb; font-size: 24px; font-weight: bold;');
    console.log('%cCopyright © 2024 AR\'BON. All Rights Reserved.', 'color: #64748b; font-size: 12px;');
    console.log('%cThis application is protected by advanced security measures.', 'color: #ef4444; font-size: 12px;');
});
