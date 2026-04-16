-- CreateTable
CREATE TABLE "ConfiguracionHoraria" (
		"id" UUID NOT NULL,
		"horaApertura" TIME NOT NULL,
		"horaCierre" TIME NOT NULL,
		"duracionMaximaCitaMinutos" INTEGER NOT NULL,
		"intervaloSlotsMinutos" INTEGER NOT NULL,
		"maxDiasAnticipacion" INTEGER NOT NULL,
		"zonaHoraria" TEXT NOT NULL DEFAULT 'America/Bogota',
		"activa" BOOLEAN NOT NULL DEFAULT true,
		"createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
		"updatedAt" TIMESTAMP(3) NOT NULL,

		CONSTRAINT "ConfiguracionHoraria_pkey" PRIMARY KEY ("id"),
		CONSTRAINT "ConfiguracionHoraria_hora_valida_check" CHECK ("horaApertura" < "horaCierre"),
		CONSTRAINT "ConfiguracionHoraria_duracion_maxima_positiva_check" CHECK ("duracionMaximaCitaMinutos" > 0),
		CONSTRAINT "ConfiguracionHoraria_intervalo_valido_check" CHECK (
			"intervaloSlotsMinutos" > 0
			AND "intervaloSlotsMinutos" <= 60
			AND MOD(60, "intervaloSlotsMinutos") = 0
		),
		CONSTRAINT "ConfiguracionHoraria_max_dias_anticipacion_positivo_check" CHECK ("maxDiasAnticipacion" > 0)
);

-- CreateIndex
CREATE INDEX "ConfiguracionHoraria_activa_idx" ON "ConfiguracionHoraria"("activa");

-- Enforce at most one active row globally
CREATE UNIQUE INDEX "ConfiguracionHoraria_single_active_idx"
ON "ConfiguracionHoraria" ("activa")
WHERE "activa" = true;
