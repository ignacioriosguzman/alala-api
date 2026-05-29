-- Agrega campo verificado al modelo User.
-- Usuarios existentes quedan como verificado=true para no romper cuentas activas.
-- Los nuevos instructores se registran con verificado=false hasta confirmar su correo.

ALTER TABLE "User" ADD COLUMN "verificado" BOOLEAN NOT NULL DEFAULT true;
