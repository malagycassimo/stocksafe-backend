-- CreateTable
CREATE TABLE "Local" (
    "id" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "temperatura_controlada" BOOLEAN NOT NULL DEFAULT false,
    "humidade_controlada" BOOLEAN NOT NULL DEFAULT false,
    "protegido_luz" BOOLEAN NOT NULL DEFAULT false,
    "area_segregada" BOOLEAN NOT NULL DEFAULT false,
    "quarentena" BOOLEAN NOT NULL DEFAULT false,
    "bloqueado" BOOLEAN NOT NULL DEFAULT false,
    "capacidade_maxima" INTEGER NOT NULL DEFAULT 0,
    "capacidade_atual" INTEGER NOT NULL DEFAULT 0,
    "local_pai_id" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Local_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Local_codigo_key" ON "Local"("codigo");

-- CreateIndex
CREATE INDEX "Local_local_pai_id_idx" ON "Local"("local_pai_id");

-- AddForeignKey
ALTER TABLE "Local" ADD CONSTRAINT "Local_local_pai_id_fkey" FOREIGN KEY ("local_pai_id") REFERENCES "Local"("id") ON DELETE CASCADE ON UPDATE CASCADE;
