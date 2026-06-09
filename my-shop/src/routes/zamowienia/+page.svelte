<script>
    import { supabase } from '$lib/supabaseClient';
    import { loadOrders, returnOrder } from '$lib/services/orders.js';
    import { authStore } from '$lib/store.svelte.js';

    // --- STAN ZAMÓWIEŃ ---
    /** @type {any[]} */
    let orders = $state([]);
    let loadingOrders = $state(true);
    let ordersExpanded = $state(false);

    // --- STAN PROFILU ---
    let profileExpanded = $state(true); 
    let savingProfile = $state(false);
    let uploadingAvatar = $state(false);
    
    // --- STAN ZMIANY HASŁA ---
    let oldPassword = $state('');
    let newPassword = $state('');
    let confirmPassword = $state('');
    let changingPassword = $state(false);
    
    let profile = $state({
        first_name: '',
        last_name: '',
        avatar_url: ''
    });

    // --- STAN ADRESU ---
    let addressExpanded = $state(false);
    let savingAddress = $state(false);
    let address = $state({
        id: null,
        street: '',
        postal_code: '',
        city: '',
        country: 'Polska'
    });

    // --- ZAGADKA 8: STAN ---
    let sudoModeActive = $state(false);

    /** @type {string | null} */
    let loadedUserId = $state(null);

    $effect(() => {
        const userId = authStore.currentUser?.id || null;

        if (!userId) {
            orders = [];
            loadedUserId = null;
            loadingOrders = false;
            return;
        }

        if (loadedUserId === userId) return;

        loadedUserId = userId;
        loadingOrders = true;

        loadOrders(userId).then((loadedOrders) => {
            if (loadedUserId === userId) {
                orders = loadedOrders;
                loadingOrders = false;
            }
        });

        loadProfile(userId);
        loadAddress(userId);
    });

    // --- LOGIKA PROFILU ---
    /** @param {string} userId */
    async function loadProfile(userId) {
        const { data } = await supabase
            .from('profiles')
            .select('first_name, last_name, avatar_url')
            .eq('id', userId)
            .single();

        if (data) {
            profile.first_name = data.first_name || '';
            profile.last_name = data.last_name || '';
            profile.avatar_url = data.avatar_url || '';
        }
    }

    async function saveProfile() {
        if (!authStore.currentUser?.id) return;
        savingProfile = true;


        //ZAGADKA 8 START


        // Sprawdzamy czy ktoś nie próbuje zhackować bazy danych komendą sudo
        if (profile.first_name.trim().toLowerCase() === 'sudo' || profile.last_name.trim().toLowerCase() === 'sudo') {
            savingProfile = false;
            sudoModeActive = true; // Aktywuje efekty specjalne!
            
            // Ukrywamy efekt po 8 sekundach, żeby nie blokować sklepu na zawsze
            setTimeout(() => {
                sudoModeActive = false;
            }, 8000);
            return;
        }


        //ZAGADKA 8 KONIEC

        const { error } = await supabase
            .from('profiles')
            .upsert({
                id: authStore.currentUser.id,
                first_name: profile.first_name,
                last_name: profile.last_name,
                avatar_url: profile.avatar_url
            });

        savingProfile = false;

        if (error) {
            alert('Błąd podczas zapisywania: ' + error.message);
        } else {
            alert('Profil zaktualizowany pomyślnie!');
        }
    }

    // --- LOGIKA WGRYWANIA ZDJĘCIA ---
    /** @param {Event} event */
    async function uploadAvatar(event) {
        const input = /** @type {HTMLInputElement} */ (event.target);
        const file = input.files?.[0];

        if (!file || !authStore.currentUser) return;

        uploadingAvatar = true;

        const fileExt = file.name.split('.').pop();
        const fileName = `${authStore.currentUser.id}-${Math.random()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
            .from('avatars')
            .upload(fileName, file);

        if (uploadError) {
            alert('Błąd podczas wgrywania zdjęcia: ' + uploadError.message);
            uploadingAvatar = false;
            return;
        }

        const { data } = supabase.storage
            .from('avatars')
            .getPublicUrl(fileName);

        profile.avatar_url = data.publicUrl;
        await saveProfile(); 
        uploadingAvatar = false;
    }

    // --- LOGIKA ZMIANY HASŁA ---
    async function changePassword() {
        if (!oldPassword || !newPassword || !confirmPassword) {
            return alert('Wypełnij wszystkie 3 pola, aby zmienić hasło!');
        }
        if (newPassword !== confirmPassword) {
            return alert('Nowe hasła nie są identyczne! Wpisz je ponownie.');
        }
        if (newPassword.length < 6) {
            return alert('Nowe hasło musi mieć co najmniej 6 znaków!');
        }
        if (oldPassword === newPassword) {
            return alert('Nowe hasło musi różnić się od starego!');
        }
        
        changingPassword = true;

        const { error: signInError } = await supabase.auth.signInWithPassword({
            email: authStore.currentUser.email,
            password: oldPassword
        });

        if (signInError) {
            changingPassword = false;
            return alert('Błędne obecne hasło! Autoryzacja odrzucona.');
        }

        const { error: updateError } = await supabase.auth.updateUser({
            password: newPassword
        });

        changingPassword = false;

        if (updateError) {
            alert('Błąd systemu podczas zmiany hasła: ' + updateError.message);
        } else {
            alert('Sukces! Twoje hasło zostało bezpiecznie zmienione.');
            oldPassword = '';
            newPassword = '';
            confirmPassword = '';
        }
    }

    // --- LOGIKA ADRESU ---
    /** @param {string} userId */
    async function loadAddress(userId) {
        const { data } = await supabase
            .from('addresses')
            .select('*')
            .eq('user_id', userId)
            .order('is_default', { ascending: false })
            .limit(1)
            .single();

        if (data) {
            address.id = data.id;
            address.street = data.street || '';
            address.postal_code = data.postal_code || '';
            address.city = data.city || '';
            address.country = data.country || 'Polska';
        }
    }

    async function saveAddress() {
        if (!authStore.currentUser?.id) return;
        savingAddress = true;

        const addressData = {
            user_id: authStore.currentUser.id,
            street: address.street,
            postal_code: address.postal_code,
            city: address.city,
            country: address.country,
            is_default: true // Oznaczamy ten adres jako główny
        };

        let queryError;

        if (address.id) {
            // Jeśli użytkownik ma już adres (znamy ID), aktualizujemy go
            const { error } = await supabase
                .from('addresses')
                .update(addressData)
                .eq('id', address.id);
            queryError = error;
        } else {
            // Jeśli to nowy klient, dodajemy nowy wiersz
            const { data, error } = await supabase
                .from('addresses')
                .insert(addressData)
                .select()
                .single();
            
            if (data) address.id = data.id; // Zapisujemy nowe ID
            queryError = error;
        }

        savingAddress = false;

        if (queryError) {
            alert('Błąd podczas zapisywania adresu: ' + queryError.message);
        } else {
            alert('Adres dostawy zaktualizowany!');
        }
    }

    // --- LOGIKA ZAMÓWIEŃ ---
    /** @param {any} order */
    async function handleReturn(order) {
        const success = await returnOrder(order);
        if (success && authStore.currentUser) {
            orders = await loadOrders(authStore.currentUser.id);
        }
    }
</script>

<svelte:head>
    <title>Panel klienta</title>
</svelte:head>

{#if sudoModeActive}
    <div class="sudo-overlay">
        <div class="sudo-terminal">
            <h2 class="glitch-text" data-text="⚠ FATAL SYSTEM ERROR ⚠">⚠ FATAL SYSTEM ERROR ⚠</h2>
            <div class="terminal-logs">
                <p>> Wprowadzono niedozwoloną komendę modyfikującą tabelę "profiles".</p>
                <p>> Wykryto próbę podniesienia uprawnień do ROOT (sudo).</p>
                <p class="error-msg">> STATUS: DOSTĘP ODRZUCONY</p>
                <p>> Uruchamianie procedury izolacji bazy danych...</p>
            </div>
            
            <div class="secret-box">
                <p>TRYB AWARYJNY AKTYWNY. PONIŻEJ ZNAJDUJE SIĘ KLUCZ DEKRYPCYJNY:</p>
                <h3 class="password-text">SUDO_MAKE_ME_A_SANDWICH</h3>
            </div>
        </div>
    </div>
{/if}
<div class="orders-container">
    <h1 class="panel-title">Panel klienta</h1>

    <button
        type="button"
        class="section-toggle"
        onclick={() => profileExpanded = !profileExpanded}
        aria-expanded={profileExpanded}
    >
        <span>{profileExpanded ? '▼' : '▶'}</span>
        <span>👤 Twoje dane i profil</span>
    </button>

    {#if profileExpanded}
        {#if !authStore.currentUser}
            <div class="empty-state">
                <p>Zaloguj się, aby edytować profil.</p>
            </div>
        {:else}
            <div class="profile-card">
                <div class="avatar-section">
                    <img 
                        src={profile.avatar_url || 'https://via.placeholder.com/150x150/2d3748/a0aec0?text=Brak+Zdjecia'} 
                        alt="Twój awatar" 
                        class="avatar-img"
                    />
                    
                    <div class="upload-wrapper">
                        <input 
                            type="file" 
                            id="avatar-upload" 
                            accept="image/*" 
                            onchange={uploadAvatar} 
                            disabled={uploadingAvatar}
                            class="hidden-file-input"
                        />
                        <label for="avatar-upload" class="action-btn upload-btn {uploadingAvatar ? 'disabled' : ''}">
                            {uploadingAvatar ? '⏳ Wgrywanie...' : '📁 Zmień zdjęcie'}
                        </label>
                    </div>
                </div>
                
                <div class="profile-form">
                    <form onsubmit={(e) => { e.preventDefault(); saveProfile(); }} class="main-form-content">
                        <div class="form-group">
                            <label for="email">Adres e-mail (Login)</label>
                            <input 
                                type="email" 
                                id="email" 
                                value={authStore.currentUser?.email || ''} 
                                disabled 
                                title="E-maila nie można zmienić z tego poziomu"
                            />
                        </div>

                        <div class="form-row">
                            <div class="form-group">
                                <label for="firstName">Imię</label>
                                <input type="text" id="firstName" bind:value={profile.first_name} placeholder="Np. Jan" />
                            </div>
                            <div class="form-group">
                                <label for="lastName">Nazwisko</label>
                                <input type="text" id="lastName" bind:value={profile.last_name} placeholder="Np. Kowalski" />
                            </div>
                        </div>

                        <button type="submit" class="action-btn save-btn" disabled={savingProfile || uploadingAvatar}>
                            {savingProfile ? 'Zapisywanie...' : 'Zapisz dane'}
                        </button>
                    </form>

                    <hr class="divider" />

                    <div class="password-section">
                        <h4 class="section-subtitle">Bezpieczeństwo konta</h4>
                        <div class="password-grid">
                            <div class="form-group">
                                <label for="oldPassword">Obecne hasło</label>
                                <input 
                                    type="password" 
                                    id="oldPassword" 
                                    bind:value={oldPassword} 
                                    placeholder="Wpisz aktualne hasło..." 
                                />
                            </div>
                            <div class="form-row">
                                <div class="form-group">
                                    <label for="newPassword">Nowe hasło</label>
                                    <input 
                                        type="password" 
                                        id="newPassword" 
                                        bind:value={newPassword} 
                                        placeholder="Min. 6 znaków" 
                                    />
                                </div>
                                <div class="form-group">
                                    <label for="confirmPassword">Potwierdź nowe hasło</label>
                                    <input 
                                        type="password" 
                                        id="confirmPassword" 
                                        bind:value={confirmPassword} 
                                        placeholder="Powtórz nowe hasło" 
                                    />
                                </div>
                            </div>
                            <button type="button" class="action-btn password-btn" onclick={changePassword} disabled={changingPassword}>
                                🔒 {changingPassword ? 'Weryfikacja i zmiana...' : 'Zaktualizuj hasło'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        {/if}
    {/if}

    <button
        type="button"
        class="section-toggle"
        onclick={() => addressExpanded = !addressExpanded}
        aria-expanded={addressExpanded}
        style="margin-top: 30px;"
    >
        <span>{addressExpanded ? '▼' : '▶'}</span>
        <span>🏠 Adres dostawy</span>
    </button>

    {#if addressExpanded}
        {#if !authStore.currentUser}
            <div class="empty-state">
                <p>Zaloguj się, aby zarządzać adresem.</p>
            </div>
        {:else}
            <div class="profile-card address-card">
                <form class="profile-form" onsubmit={(e) => { e.preventDefault(); saveAddress(); }}>
                    <div class="form-group">
                        <label for="street">Ulica i numer lokalu</label>
                        <input type="text" id="street" bind:value={address.street} placeholder="Np. ul. Kwiatowa 12/4" />
                    </div>

                    <div class="form-row">
                        <div class="form-group" style="flex: 1;">
                            <label for="postalCode">Kod pocztowy</label>
                            <input type="text" id="postalCode" bind:value={address.postal_code} placeholder="Np. 00-001" />
                        </div>
                        <div class="form-group" style="flex: 2;">
                            <label for="city">Miejscowość</label>
                            <input type="text" id="city" bind:value={address.city} placeholder="Np. Warszawa" />
                        </div>
                    </div>

                    <div class="form-group">
                        <label for="country">Kraj</label>
                        <input type="text" id="country" bind:value={address.country} placeholder="Np. Polska" />
                    </div>

                    <button type="submit" class="action-btn save-btn" disabled={savingAddress}>
                        {savingAddress ? 'Zapisywanie...' : 'Zapisz adres'}
                    </button>
                </form>
            </div>
        {/if}
    {/if}

    <button
        type="button"
        class="section-toggle"
        onclick={() => ordersExpanded = !ordersExpanded}
        aria-expanded={ordersExpanded}
        style="margin-top: 30px;"
    >
        <span>{ordersExpanded ? '▼' : '▶'}</span>
        <span>📦 Twoje zamówienia i zwroty</span>
    </button>

    {#if ordersExpanded}
        {#if loadingOrders}
            <p class="loading-text">Ładowanie historii zamówień...</p>
        {:else if !authStore.currentUser}
            <div class="empty-state">
                <p>Musisz być zalogowany jako klient, aby zobaczyć swoje zamówienia.</p>
                <button onclick={() => window.location.href = '/'} class="action-btn">Wróć do sklepu</button>
            </div>
        {:else if orders.length === 0}
            <div class="empty-state">
                <p>Nie masz jeszcze żadnych zamówień w naszej bazie.</p>
                <button onclick={() => window.location.href = '/'} class="action-btn">Przejdź do katalogu</button>
            </div>
        {:else}
            <div class="orders-list">
                {#each orders as order (order.id)}
                    <div class="order-card">
                        <div class="order-header">
                            <div class="order-info">
                                <span class="order-date">📅 {new Date(order.created_at).toLocaleDateString()}</span>
                                <span class="order-total">💰 {order.total_amount.toFixed(2)} zł</span>
                            </div>
                            <span class="status-badge {order.status}">
                                {order.status === 'paid' ? 'Opłacone' : order.status === 'return_requested' ? 'Oczekuje na zwrot' : order.status === 'returned' ? 'Zwrócone' : order.status === 'return_rejected' ? 'Zwrot odrzucony' : order.status}
                            </span>
                        </div>
                        
                        {#if order.addresses}
                            <div class="order-shipping-address">
                                📍 <strong>Adres dostawy:</strong> {order.addresses.street}, {order.addresses.postal_code} {order.addresses.city}
                            </div>
                        {:else}
                            <div class="order-shipping-address" style="border-style: dashed; opacity: 0.7;">
                                📍 <strong>Adres dostawy:</strong> Brak danych
                            </div>
                        {/if}
                        
                        <div class="order-items">
                            <h4>Kupione produkty:</h4>
                            <ul>
                                {#each order.order_items as item (item.id)}
                                    <li>
                                        <span class="item-name">{item.products?.name}</span> 
                                        <span class="item-details">{item.quantity} szt. ({item.price_at_time} zł/szt.)</span>
                                    </li>
                                {/each}
                            </ul>
                        </div>

                        {#if order.status === 'paid'}
                            <div class="order-actions">
                                <button class="return-btn" onclick={() => handleReturn(order)}>Zwróć zamówienie</button>
                            </div>
                        {/if}
                    </div>
                {/each}
            </div>
        {/if}
    {/if}
</div>

<style>


    /*Zagadka 8 START*/


    .sudo-overlay {
        position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
        background-color: rgba(15, 0, 0, 0.95);
        z-index: 99999;
        display: flex; justify-content: center; align-items: center;
        font-family: 'Courier New', Courier, monospace;
        color: #ff3333;
        overflow: hidden;
    }

    .sudo-terminal {
        background: #000; border: 2px solid #ff3333; padding: 40px;
        box-shadow: 0 0 40px rgba(255, 51, 51, 0.5);
        max-width: 700px; width: 90%;
        animation: shake 0.5s infinite alternate;
    }

    .glitch-text {
        font-size: 2.5rem; font-weight: 900; margin-top: 0; text-align: center;
        text-shadow: 2px 0 #00ffff, -2px 0 #ff00ff;
        animation: glitch-anim 0.3s infinite linear alternate-reverse;
    }

    .terminal-logs p { font-size: 1.1rem; line-height: 1.5; margin-bottom: 10px; }
    .error-msg { font-weight: bold; background: #ff3333; color: #000; padding: 2px 5px; display: inline-block; }

    .secret-box {
        margin-top: 30px; border-top: 1px dashed #ff3333; padding-top: 20px;
        text-align: center;
    }

    .password-text {
        font-size: 2.5rem; color: #00ffcc; letter-spacing: 5px;
        text-shadow: 0 0 15px #00ffcc; margin: 10px 0;
    }

    @keyframes shake {
        0% { transform: translate(1px, 1px) rotate(0deg); }
        10% { transform: translate(-1px, -2px) rotate(-1deg); }
        20% { transform: translate(-3px, 0px) rotate(1deg); }
        30% { transform: translate(3px, 2px) rotate(0deg); }
        40% { transform: translate(1px, -1px) rotate(1deg); }
        50% { transform: translate(-1px, 2px) rotate(-1deg); }
        60% { transform: translate(-3px, 1px) rotate(0deg); }
        70% { transform: translate(3px, 1px) rotate(-1deg); }
        80% { transform: translate(-1px, -1px) rotate(1deg); }
        90% { transform: translate(1px, 2px) rotate(0deg); }
        100% { transform: translate(1px, -2px) rotate(-1deg); }
    }

    @keyframes glitch-anim {
        0% { transform: skewX(0deg); }
        20% { transform: skewX(-5deg); }
        40% { transform: skewX(5deg); }
        60% { transform: skewX(0deg); }
        80% { transform: skewX(2deg); }
        100% { transform: skewX(-2deg); }
    }


    /*ZAGADKA 8 KONIEC*/

    .orders-container { max-width: 900px; margin: 40px auto; padding: 20px; }
    .panel-title { margin: 0 0 40px 0; font-size: 1.5rem; font-weight: bold; color: #ffffff; }

    .section-toggle {
        width: 100%; display: flex; align-items: center; gap: 10px;
        background: transparent; color: #ffffff; border: none;
        padding: 0 0 16px 0; margin: 0 0 24px 0; border-bottom: 2px solid #2d3748;
        font-size: 1.2rem; font-weight: 600; cursor: pointer; text-align: left; transition: color 0.2s;
    }
    .section-toggle:hover { color: #3182ce; }

    .loading-text, .empty-state { text-align: center; padding: 40px; background: #1a202c; border-radius: 8px; border: 1px dashed #4a5568; color: #a0aec0; }
    
    .action-btn { background: #3182ce; color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; font-weight: bold; transition: background-color 0.2s; }
    .action-btn:hover { background: #2b6cb0; }

    /* KARTY Z FORMULARZAMI (Profil i Adres) */
    .profile-card { background: #1a202c; padding: 30px; margin-bottom: 20px; border-radius: 8px; border-left: 5px solid #48bb78; box-shadow: 0 4px 6px rgba(0,0,0,0.2); display: flex; gap: 40px; }
    .address-card { border-left: 5px solid #ecc94b; }
    
    .avatar-section { flex-shrink: 0; display: flex; flex-direction: column; align-items: center; gap: 15px;}
    .avatar-img { width: 150px; height: 150px; border-radius: 50%; object-fit: cover; border: 4px solid #2d3748; background-color: #0b0b0f; }
    
    .hidden-file-input { display: none; }
    .upload-btn { background: #2d3748; margin-top: 0; font-size: 0.85rem; padding: 8px 15px; border: 1px solid #4a5568; text-align: center; display: block; width: 100%; box-sizing: border-box;}
    .upload-btn:hover { background: #4a5568; }
    .upload-btn.disabled { opacity: 0.5; cursor: wait; background: #1a202c; }

    .profile-form { flex-grow: 1; display: flex; flex-direction: column; }
    .main-form-content { display: flex; flex-direction: column; gap: 15px; }
    
    .form-row { display: flex; gap: 20px; width: 100%; }
    .form-row .form-group { flex: 1; }
    
    .form-group { display: flex; flex-direction: column; gap: 6px; margin-bottom: 15px; }
    .form-group label { font-size: 0.9rem; color: #a0aec0; font-weight: bold; }
    .form-group input { background: #2d3748; border: 1px solid #4a5568; color: white; padding: 12px; border-radius: 6px; font-size: 1rem; }
    .form-group input:disabled { background: #1a202c; color: #718096; cursor: not-allowed; }
    .form-group input:focus { outline: none; border-color: #3182ce; }

    .save-btn { background: #48bb78; align-self: flex-start; margin-top: 5px; }
    .save-btn:hover { background: #38a169; }
    .save-btn:disabled { background: #2f855a; opacity: 0.7; cursor: wait; }

    /* SEKCJA ZMIANY HASŁA */
    .divider { border: 0; border-top: 1px dashed #4a5568; margin: 25px 0 20px 0; width: 100%; }
    .section-subtitle { margin: 0 0 15px 0; color: #e2e8f0; font-size: 1.05rem; }
    .password-grid { display: flex; flex-direction: column; gap: 15px; background: rgba(0,0,0,0.15); padding: 20px; border-radius: 8px; border: 1px solid #2d3748; }
    .password-btn { background: #4a5568; margin-top: 10px; align-self: flex-start; }
    .password-btn:hover { background: #2d3748; border: 1px solid #a0aec0;}

    /* ZAMÓWIENIA */
    .order-card { background: #1a202c; padding: 20px; margin-bottom: 20px; border-radius: 8px; border-left: 5px solid #3182ce; box-shadow: 0 4px 6px rgba(0,0,0,0.2); }
    .order-header { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #2d3748; padding-bottom: 15px; margin-bottom: 15px; }
    .order-info { display: flex; gap: 20px; font-size: 1.1rem; font-weight: bold; }
    .order-date { color: #a0aec0; }
    .order-total { color: #48bb78; }
    .status-badge { padding: 6px 12px; border-radius: 20px; font-size: 0.85rem; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px; }
    .status-badge.paid { background: rgba(72, 187, 120, 0.2); color: #48bb78; border: 1px solid #48bb78; }
    .status-badge.return_requested { background: rgba(237, 137, 54, 0.2); color: #f6ad55; border: 1px solid #f6ad55; }
    .status-badge.returned { background: rgba(229, 62, 62, 0.2); color: #fc8181; border: 1px solid #fc8181; }

    .order-items h4 { margin: 0 0 10px 0; color: #a0aec0; font-size: 0.9rem; text-transform: uppercase; }
    .order-items ul { list-style: none; padding: 0; margin: 0; }
    .order-items li { display: flex; justify-content: space-between; margin-bottom: 8px; padding: 8px; background: #2d3748; border-radius: 4px; }
    .item-name { font-weight: bold; color: #e2e8f0; }
    .item-details { color: #a0aec0; font-size: 0.9rem; }

    .order-actions { margin-top: 20px; text-align: right; border-top: 1px dashed #2d3748; padding-top: 15px;}
    .return-btn { background: #e53e3e; color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; font-weight: bold; transition: all 0.2s; }
    .return-btn:hover { background: #c53030; transform: translateY(-2px); }
    
    .order-shipping-address { background: #232a34; padding: 10px 14px; border-radius: 6px; font-size: 0.9rem; margin-bottom: 20px; color: #cbd5e1; border: 1px solid #2d3748; }

    @media (max-width: 600px) {
        .profile-card { flex-direction: column; align-items: center; }
        .form-row { flex-direction: column; gap: 15px; }
        .save-btn, .password-btn { width: 100%; }
        .avatar-section { width: 100%; }
    }
</style>