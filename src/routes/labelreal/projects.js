import Project from '../../data/models/Project'
import User from '../../data/models/User'
import {
  generateColor,
  resBuild,
  resErrorBuild,
  statusDesc,
  userTypeDesc,
  userType,
  status,
} from '../../data/dataUtils'
import express from 'express'
import path from 'path'
import _ from 'underscore'

const router = express.Router()

router.post('/create', (req, res) => {
  const {userId,fileDirectory,machineId} = req.body
  const name = path.basename(fileDirectory, '.tpy');
  const cover = '/default-cover.jpg'
  let projectObj = {name,cover,...req.body}
  Project.create(projectObj).then(project => {
    //创建方式, createType:0 means has userId, createType:1 means only has machineId
    if (!_.isEmpty(userId)) {
      return User.findById(userId).then(user => {
        user.addProjects(project, {through: {isOwner: true}})
        res.json(resBuild(project))
      })
    } else {
      return User.findOne({
        where:{machineId}
      }).then(user=>{
        if(!_.isEmpty(user)){
          return User.findById(user.userId).then(user => {
            user.addProjects(project, {through: {isOwner: true}})
            res.json(resBuild(project))
          })
        }else{
          let userObj = {
            userTypeDesc: userTypeDesc[userType.temporary],
            userType: userType.temporary,
            statusDesc: statusDesc[status.temp],
            avatarColor: generateColor(),
            machineId,
            name:machineId
          }
          return User.create(userObj).then(user => {
            user.addProjects(project, {through: {isOwner: true}})
            res.json(resBuild(user))
          })
        }
      })
    }
  }).catch(err => {
    resErrorBuild(res, 500, err)
  })
})

export default router
