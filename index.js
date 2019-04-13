const express = require('express');
const app = express();
const bodyParser = require('body-parser');

const path = require('path');

const sqllite = require('sqlite');
const dbConnection = sqllite.open(path.resolve(__dirname, 'banco.sqlite'),{Promise});

const port = process.env.PORT || 3000;

app.set('views', path.join(__dirname,'views'))
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({extended:true}));

//call back function
app.get('/', async(request, response) => {
    const db = await dbConnection;
    const categoriasDb = await db.all('select * from categorias;');
    const vagas = await db.all('select * from vagas;');
    
    const categorias = categoriasDb.map(cat =>{
        return {
            ...cat,
            vagas: vagas.filter(vaga => vaga.categoriaId === cat.id)
        }
    })
    //Ver a saída do objeto
    //console.log(categorias);

    response.render('home', {
        categorias
    });
})

app.get('/vaga/:id', async(request, response) => {
    //retorno do parâmetro
    //console.log(request.params.id);
    const db = await dbConnection;
    const vaga = await db.get('select * from vagas where id = ' + request.params.id );
    //resulte da vaga
    //console.log (vaga);
    response.render('vaga', {
        vaga
    });
})

app.get('/admin', (req, res) => {
    res.render('admin/home');
})

app.get('/admin/vagas', async(req, res) => {
    const db = await dbConnection;
    const vagas = await db.all('select * from vagas;');
    res.render('admin/vagas', {
        vagas
    })
})

app.get('/admin/vagas/delete/:id', async(req, res) =>{
    const db = await dbConnection;
    await db.run('delete from vagas where id = ' + req.params.id);
    res.redirect('/admin/vagas');
})

app.get('/admin/vagas/nova', async(req, res) => {
    const db = await dbConnection;
    const categorias = await db.all('select * from categorias;');
    res.render('admin/nova-vaga', {
        categorias
    });
})

app.post('/admin/vagas/nova', async(req, res) => {
    
    const{titulo,descricao,categoriaId} = req.body
    const db = await dbConnection;
    await db.run(`insert into vagas(categoriaId, titulo, descricao)values(${categoriaId},'${titulo}', '${descricao}')`);
    
    res.redirect('/admin/vagas');
})

app.get('/admin/vagas/editar/:id', async(req, res) => {
    const db = await dbConnection;
    const categorias = await db.all('select * from categorias;');
    const vaga = await db.get('select * from vagas where id = ' + req.params.id);
    res.render('admin/editar-vaga', {
        categorias, vaga
    });
})

app.post('/admin/vagas/editar/:id', async(req, res) => {
    
    const{titulo,descricao,categoriaId} = req.body
    const {id} = req.params;
    const db = await dbConnection;
    await db.run(`update vagas set categoriaId = ${categoriaId}, titulo = '${titulo}', descricao = '${descricao}' where id = ${id}`);
    
    res.redirect('/admin/vagas');
})

app.get('/curriculum',(request,response) =>{
    response.render('curriculum',{

    });
})

const init = async()=>{
    const db = await dbConnection
    await db.run('create table if not exists categorias(id INTEGER PRIMARY KEY, categoria TEXT);');
    await db.run('create table if not exists vagas(id INTEGER PRIMARY KEY, categoriaId INTEGER, titulo TEXT,descricao TEXT);');
    //const categoria = 'Marketing team';
    //await db.run(`insert into categorias(categoria)values('${categoria}')`);
    const titulo = 'Social Media (San Francisco)';
    const descricao = 'Vaga para fullstack developer que fez o FullStack Lab';
    //await db.run(`insert into vagas(categoriaId, titulo, descricao)values(2,'${titulo}', '${descricao}')`);
    
}

init();

app.listen(port, (err) => {
    if (err){
        console.log('Não foi possível inicial o servidor do Jobify')
    }else{
        console.log('Servidor do Jobify rodando ....')
    }
})