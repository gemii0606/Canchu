# 使用 Node.js 14 作為基礎映像
FROM node:18-alpine

# 設置工作目錄
WORKDIR /app

# 複製 package.json 和 package-lock.json 到容器中
COPY . /app/

# 安裝相依項目
RUN npm install

# 定義容器運行時指令
CMD ["node", "app.js"]