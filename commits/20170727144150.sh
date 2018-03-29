#!/bin/bash

cd /projects/P01934/Web_Code_Manager_Development/
date >> /projects/P01934/Web_Code_Manager_Development/commits/20170727144150.log
/home/gbrewer/bin/TEE-CLC-14.114.0/tf add * -recursive -login:Administrator,\!1mpa1a\#16 &>> /projects/P01934/Web_Code_Manager_Development/commits/20170727144150.log
/home/gbrewer/bin/TEE-CLC-14.114.0/tf commit -comment:"File Manager v1.0.1" -login:Administrator,\!1mpa1a\#16 &>> /projects/P01934/Web_Code_Manager_Development/commits/20170727144150.log
date >> /projects/P01934/Web_Code_Manager_Development/commits/20170727144150.log
