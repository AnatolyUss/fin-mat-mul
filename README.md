<h2>FIN-MAT-MUL</h2>

<p>This project is for learning purposes.</p>
<p>Sample service for matrices multiplication.</p>

<h3>SYSTEM REQUIREMENTS</h3>
<ul>
<li> <b>Node.js 10 or higher</b></li>
</ul>

<h3>USAGE</h3>
<p><b>1.</b> Go to your projects directory <code>$ cd /path/to/projects</code></p>
<p><b>2.</b> Clone the project <code>$ git clone https://github.com/AnatolyUss/fin-mat-mul.git</code></p>
<p><b>3.</b> Install dependencies <code>$ npm install</code></p>
<p><b>4.</b> Compile the code <code>$ npm run build</code></p>
<p><b>5.</b> Run the server <code>$ npm start</code></p>
<p><b>6.</b> Now the server is listening on <code>http://localhost:3000</code></p>

<h3>Endpoints usage samples:</h3>
<ul>
    <li><code>GET http://localhost:3000/generate?columns=700&rows=650</code></li>
    <li><code>POST http://localhost:3000/upload</code> You need to send one or more files as a part of form-data.</li>
    <li><code>GET http://localhost:3000/multiply?matrix-1=matrix-rows_1200-columns_1000-1599090639875.csv&matrix-2=matrix-rows_1000-columns_2000-1599090657968.csv</code></li>
</ul>
