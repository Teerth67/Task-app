const express=require('express')
const User=require('../models/user')
const auth=require('../middleware/auth.js')
const multer=require('multer')
const sharp=require('sharp')
const router =new express.Router()

const{sendWelcomeEmail,sendCancelationEmail}=require('../emails/account')

router.post('/users', async (req, res) => {
    const user = new User(req.body);
    try {

        await user.save();
        sendWelcomeEmail(user.email,user.name)
        const token = await user.generateAuthToken()
        res.status(201).send({user,token});
    } catch (error) {
        if (error.code === 11000 && error.keyPattern && error.keyPattern.email) {
            // Duplicate key error (email already exists)
            res.status(400).send({ error: 'Email address is already in use' });
        } else {
            // Other validation or save errors
            console.error('Error creating user:', error);
            res.status(400).send(error);
        }
    }
});

router.post('/users/login',async(req,res)=>{
    try{
        const user =await User.findbyCredentials(req.body.email,req.body.password)
        const token = await user.generateAuthToken()
        res.send({user,token})
    }catch(e){
        res.status(400).send()

    }
})
router.post('/user/logout',auth,async(req,res)=>{
    try{
        req.user.tokens=req.user.tokens.filter((token)=>{
         return token.token!==req.token
        })
await req.user.save()
res.send()
    }catch(e){
        res.status(500).send()
    }

})
router.post('/user/logoutall',auth,async(req,res)=>{
    try{
        req.user.tokens=[]
 await req.user.save()
 res.send()
    }catch(e){
        res.status(500).send()

    }
})
router.patch('/users/me',auth,async(req,res)=>{
    const updates=Object.keys(req.body)
    const allowedUpdates=['name','age','email','password']
    const validop=updates.every((update)=>
        allowedUpdates.includes(update))
        if(!validop){
            return res.status(400).send({error:"invalid updatess"})
        }
        try{
           const user=await User.findById(req.user._id)
            updates.forEach((update)=>req.user[update]=req.body[update])
            await user.save()
            // if(!user){
            //     return res.status(404).send()
            // }
            res.send(req.user)
        }catch(e){
            res.status(400).send(e)
        }
})

router.get('/users/me',auth,async(req,res)=>{
   res.send(req.user)
    
    
 

  
      
  
})
// router.get('/users/:id',async(req,res)=>{
//     const _id =req.params.id
//     try{const user=  await User.findById({_id})
//     if(!user){
//         return  res.status(404).send()

//     }
    
//     res.send(user)}catch(e){
        
//         res.status(500).send()

//     }
  

    
    
// })
router.delete('/users/me',auth,async(req,res)=>{
    try{
        const user=await User.findByIdAndDelete(req.user._id)
        // if(!user){
        //     return  res.status(404).send()
        // }
sendCancelationEmail(req.user.email,req.user.name)
        await req.user.remove()
        res.send(req.user)

    }catch(e){
        res.status(500).send()


    }
   
})
const upload=multer({
    
    limits:{
        fileSize:1000000
    },
    fileFilter(req,file,cb){
        if(!file.originalname.match(/\.(jpg|jpeg|png)$/)){
            return cb(new Error('Pls upload image'))
        }
        cb(undefined,true)
    }
})
router.post('/user/me/avatar',auth,upload.single('upload'),async(req,res)=>{
    const buffer=await sharp(req.file.buffer).resize({width:250,height:250}).png().toBuffer()
    req.user.upload=buffer
    await req.user.save()
    res.send()

},(error,req,res,next)=>{
    res.status(400).send({error:error.message})
    
})
router.delete('/user/me/avatar',auth,async(req,res)=>{
    req.user.upload=undefined
    await req.user.save()
    res.send()


    
})
router.get('/user/:id/avatar',auth,async(req,res)=>{
try{
    const user=await User.findById(req.params.id)
    if(!user||!user.upload){
        throw new Error()
    }
    res.set('Content-Type','image/jpg')
    res.send(user.upload)
}catch(e){
res.status(404).send()
}


    
})

module.exports=router