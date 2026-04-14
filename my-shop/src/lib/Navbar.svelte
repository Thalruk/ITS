<nav class="navbar">
  <div class="logo">
    <a href="/">MojaStrona</a>
  </div>
  
  <ul class="nav-links">
    <li><a href="/">Strona Główna</a></li>
    <li><a href="/o-nas">O nas</a></li>
    <li><a href="/kontakt">Kontakt</a></li>
  </ul>
</nav>

<style>
  /* Stylujemy główny kontener nawigacji */
  .navbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background-color: #333;
    padding: 1rem 2rem;
    color: white;
  }

  /* Stylujemy logo */
  .logo a {
    font-size: 1.5rem;
    font-weight: bold;
    color: white;
    text-decoration: none;
  }

  /* Stylujemy listę linków (usuwamy kropki i układamy w rzędzie) */
  .nav-links {
    list-style: none;
    display: flex;
    gap: 1.5rem;
    margin: 0;
    padding: 0;
  }

  /* Stylujemy same linki */
  .nav-links a {
    color: white;
    text-decoration: none;
    font-size: 1.1rem;
    transition: color 0.3s ease;
  }

  /* Efekt po najechaniu myszką */
  .nav-links a:hover {
    color: #4da6ff;
  }
</style>